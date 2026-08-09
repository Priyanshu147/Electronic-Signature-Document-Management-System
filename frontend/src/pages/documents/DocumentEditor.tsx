import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Document, pdfjs } from "react-pdf";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Tooltip,
  CircularProgress,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import toast from "react-hot-toast";

import { documentApi } from "../../api/document.api";
import { signerRoleApi } from "../../api/signerRole.api";
import { SignerRoleSidebar } from "../../components/signer/SignerRoleSidebar";
import { PdfPageCanvas } from "../../components/pdf/PdfPageCanvas";
import type { PlacedSignatureField } from "../../components/signer/SignatureFieldBox";
import type { DocumentStatus, SaveSignatureFieldPayload } from "../../types/document.types";
import { EditDocumentNameDialog } from "../../components/forms/EditDocumentNameDialog";

// Configure PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const documentId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.0);

  const [placedFields, setPlacedFields] = useState<PlacedSignatureField[]>([]);
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);

  // Fetch Document Details
  const {
    data: docData,
    isLoading: docLoading,
    isError: docError,
  } = useQuery({
    queryKey: ["documentDetail", documentId],
    queryFn: () => documentApi.getDocumentById(documentId),
    enabled: !!documentId,
  });

  // Fetch Signer Roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["signerRoles"],
    queryFn: () => signerRoleApi.getSignerRoles(),
  });

  // Fetch Existing Signature Fields
  const { data: fieldsData, isLoading: fieldsLoading } = useQuery({
    queryKey: ["documentSignatureFields", documentId],
    queryFn: () => documentApi.getSignatureFields(documentId),
    enabled: !!documentId,
  });

  // Update Document Mutation
  const updateMutation = useMutation({
    mutationFn: ({ name, status }: { name: string; status?: DocumentStatus }) =>
      documentApi.updateDocument(documentId, name, status),
    onSuccess: () => {
      toast.success("Document details updated successfully!");
      setRenameDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["documentDetail", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update document.");
    },
  });

  // Fetch PDF File Blob
  useEffect(() => {
    let active = true;
    let url: string | null = null;

    if (documentId) {
      documentApi
        .downloadDocument(documentId)
        .then((blob) => {
          if (active) {
            url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
          }
        })
        .catch((err) => {
          toast.error("Failed to load PDF document: " + (err.message || ""));
        });
    }

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [documentId]);

  // Load existing signature fields into state
  useEffect(() => {
    if (fieldsData?.data) {
      const existing: PlacedSignatureField[] = fieldsData.data.map((f, idx) => ({
        tempId: `existing-${f.id || idx}-${Date.now()}`,
        signerRoleId: f.signer_role_id,
        roleName: f.role_name || `Role #${f.signer_role_id}`,
        pageNumber: f.page_number,
        xPosition: f.x_position,
        yPosition: f.y_position,
        width: f.width,
        height: f.height,
        required: f.required ?? true,
      }));
      setPlacedFields(existing);
    }
  }, [fieldsData]);

  // Save Signature Fields Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: SaveSignatureFieldPayload[]) =>
      documentApi.saveSignatureFields(documentId, { fields: payload }),
    onSuccess: (res) => {
      toast.success(res.message || "Signature fields saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["documentSignatureFields", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save signature fields.");
    },
  });

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    setJumpPageInput("1");
  };

  const handleAddField = (newField: Omit<PlacedSignatureField, "tempId">) => {
    const tempId = `field-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setPlacedFields((prev) => [...prev, { ...newField, tempId }]);
    toast.success(`Added ${newField.roleName} signature field to Page ${newField.pageNumber}`);
  };

  const handleUpdateField = (updated: PlacedSignatureField) => {
    setPlacedFields((prev) => prev.map((f) => (f.tempId === updated.tempId ? updated : f)));
  };

  const handleDeleteField = (tempId: string) => {
    setPlacedFields((prev) => prev.filter((f) => f.tempId !== tempId));
    toast.success("Signature field removed");
  };

  const handleSave = async () => {
    const payload: SaveSignatureFieldPayload[] = placedFields.map((f) => ({
      signerRoleId: f.signerRoleId,
      pageNumber: f.pageNumber,
      xPosition: f.xPosition,
      yPosition: f.yPosition,
      width: f.width,
      height: f.height,
      required: f.required,
    }));

    await saveMutation.mutateAsync(payload);
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      setCurrentPage(p);
      const el = document.getElementById(`pdf-page-${p}`);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  const documentDetail = docData?.data;
  const signerRoles = rolesData?.data || [];

  if (docError) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load document details. Please check if the document exists.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/user/documents")}>
          Back to Document List
        </Button>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        {/* Top Editor Toolbar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={() => navigate("/user/documents")} color="inherit" size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {documentDetail?.document_name || "Document Editor"}
                </Typography>
                <Tooltip title="Edit Document Details & Status">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setRenameDialogOpen(true)}
                  >
                    <DriveFileRenameOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Status:{" "}
                <Chip
                  label={documentDetail?.status || "Draft"}
                  size="small"
                  variant="outlined"
                  onClick={() => setRenameDialogOpen(true)}
                  sx={{ height: 20, cursor: "pointer" }}
                />{" "}
                • {numPages} Pages • {placedFields.length} Signature Field(s)
              </Typography>
            </Box>
          </Box>

          {/* Controls: Zoom & Page Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {/* Zoom Controls */}
            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 2, px: 0.5 }}>
              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" sx={{ minWidth: 45, textAlign: "center", fontWeight: 700 }}>
                {Math.round(scale * 100)}%
              </Typography>
              <Tooltip title="Zoom In">
                <IconButton size="small" onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Zoom">
                <IconButton size="small" onClick={() => setScale(1.0)}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Jump to Page */}
            <Box
              component="form"
              onSubmit={handlePageJumpSubmit}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <IconButton
                size="small"
                disabled={currentPage <= 1}
                onClick={() => {
                  const p = currentPage - 1;
                  setCurrentPage(p);
                  setJumpPageInput(String(p));
                  document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                Page
              </Typography>
              <TextField
                size="small"
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                sx={{ width: 60, "& input": { textAlign: "center", py: 0.5, px: 1 } }}
              />
              <Typography variant="body2" color="text.secondary">
                of {numPages || 1}
              </Typography>
              <IconButton
                size="small"
                disabled={currentPage >= numPages}
                onClick={() => {
                  const p = currentPage + 1;
                  setCurrentPage(p);
                  setJumpPageInput(String(p));
                  document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <NavigateNextIcon />
              </IconButton>
            </Box>

            {/* Save Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saveMutation.isPending}
              sx={{ borderRadius: 2, px: 3, py: 0.8, fontWeight: 700 }}
            >
              {saveMutation.isPending ? "Saving..." : "Save Fields"}
            </Button>
          </Box>
        </Paper>

        {/* Main Work Area: Left Sidebar + Center Scrollable PDF Canvas */}
        <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden", borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)" }}>
          {/* Left Signer Role Drag Source Sidebar */}
          <SignerRoleSidebar roles={signerRoles} loading={rolesLoading} />

          {/* PDF Viewer Container */}
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "#e2e8f0",
              overflowY: "auto",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {docLoading || fieldsLoading || !pdfBlobUrl ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Loading PDF Document...
                </Typography>
              </Box>
            ) : (
              <Document
                file={pdfBlobUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                loading={
                  <Box sx={{ p: 6, textAlign: "center" }}>
                    <CircularProgress size={40} />
                  </Box>
                }
              >
                {Array.from(new Array(numPages), (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <PdfPageCanvas
                      key={`page_${pageNum}`}
                      pageNumber={pageNum}
                      scale={scale}
                      fields={placedFields}
                      onAddField={handleAddField}
                      onUpdateField={handleUpdateField}
                      onDeleteField={handleDeleteField}
                    />
                  );
                })}
              </Document>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Details & Status Dialog */}
      {documentDetail && (
        <EditDocumentNameDialog
          open={renameDialogOpen}
          currentName={documentDetail.document_name}
          currentStatus={documentDetail.status}
          loading={updateMutation.isPending}
          onClose={() => setRenameDialogOpen(false)}
          onSubmit={async (newName, newStatus) => {
            await updateMutation.mutateAsync({ name: newName, status: newStatus });
          }}
        />
      )}
    </DndProvider>
  );
};
