import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Document, pdfjs } from "react-pdf";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
  const [scale, setScale] = useState<number>(1.0);

  const [placedFields, setPlacedFields] = useState<PlacedSignatureField[]>([]);
  const [selectedField, setSelectedField] = useState<PlacedSignatureField | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    staleTime: 0,
    refetchOnMount: "always",
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

  // Fetch PDF File Blob (pass raw=true to fetch clean unburned PDF for editor)
  useEffect(() => {
    let active = true;
    let url: string | null = null;

    if (documentId) {
      documentApi
        .downloadDocument(documentId, true)
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
  };

  const handleAddField = (newField: Omit<PlacedSignatureField, "tempId">) => {
    const tempId = `field-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const created = { ...newField, tempId };
    setPlacedFields((prev) => [...prev, created]);
    setSelectedField(created);
    toast.success(`Added ${newField.roleName} signature box to Page ${newField.pageNumber}`);
  };

  const handleUpdateField = (updated: PlacedSignatureField) => {
    setPlacedFields((prev) => prev.map((f) => (f.tempId === updated.tempId ? updated : f)));
    if (selectedField?.tempId === updated.tempId) {
      setSelectedField(updated);
    }
  };

  const handleDeleteField = (tempId: string) => {
    setPlacedFields((prev) => prev.filter((f) => f.tempId !== tempId));
    if (selectedField?.tempId === tempId) {
      setSelectedField(null);
    }
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

  // Scroll listener to update active page number dynamically as PDF is scrolled
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerHeight = containerRect.height;
      const targetY = containerTop + Math.min(150, containerHeight / 3);

      let activePage = 1;
      let minDistance = Infinity;

      for (let i = 1; i <= numPages; i++) {
        const pageEl = document.getElementById(`pdf-page-${i}`);
        if (pageEl) {
          const pageRect = pageEl.getBoundingClientRect();
          if (pageRect.top <= targetY && pageRect.bottom >= containerTop) {
            activePage = i;
            break;
          }
          const distance = Math.abs(pageRect.top - targetY);
          if (distance < minDistance) {
            minDistance = distance;
            activePage = i;
          }
        }
      }

      setCurrentPage((prev) => (prev !== activePage ? activePage : prev));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [numPages]);

  const handlePageJump = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
      isProgrammaticScrollRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      document.getElementById(`pdf-page-${page}`)?.scrollIntoView({ behavior: "smooth" });
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    }
  };

  const documentDetail = docData?.data;
  const signerRoles = rolesData?.data || [];

  if (docError) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Failed to load document details. Please check if the document exists.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/user/documents")}>
          Back to Documents List
        </Button>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: "calc(100vh - 110px)", display: "flex", flexDirection: "column" }}>
        {/* DocuSign Top Editor Toolbar */}
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 2.5,
            p: 1.5,
            px: 2.5,
            mb: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Header Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={() => navigate("/user/documents")} size="small" sx={{ border: "1px solid #E5E7EB" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
                  {documentDetail?.document_name || "Document Editor"}
                </Typography>
                <IconButton size="small" onClick={() => setRenameDialogOpen(true)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Status:{" "}
                <Chip
                  label={documentDetail?.status || "Draft"}
                  size="small"
                  color="primary"
                  onClick={() => setRenameDialogOpen(true)}
                  sx={{ cursor: "pointer", height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                />{" "}
                • {numPages} Pages • {placedFields.length} Signature Field(s)
              </Typography>
            </Box>
          </Box>

          {/* Controls: Zoom, Page Navigation, Save */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {/* Zoom Controls */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                px: 0.5,
                bgcolor: "#F8FAFC",
              }}
            >
              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" sx={{ minWidth: 44, textAlign: "center", fontWeight: 600 }}>
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

            {/* Page Jump Controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                disabled={currentPage <= 1}
                onClick={() => handlePageJump(currentPage - 1)}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                Page
              </Typography>
              <TextField
                size="small"
                type="number"
                value={currentPage}
                onChange={(e) => handlePageJump(parseInt(e.target.value, 10) || 1)}
                slotProps={{
                  htmlInput: { min: 1, max: numPages || 1, style: { textAlign: "center", padding: "4px 8px" } },
                }}
                sx={{ width: 56 }}
              />
              <Typography variant="caption" color="text.secondary">
                of {numPages || 1}
              </Typography>
              <IconButton
                size="small"
                disabled={currentPage >= numPages}
                onClick={() => handlePageJump(currentPage + 1)}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Save Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              disabled={saveMutation.isPending}
              onClick={handleSave}
              sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
            >
              {saveMutation.isPending ? "Saving..." : "Save Signature Fields"}
            </Button>
          </Box>
        </Box>

        {/* DocuSign Layout Body: Left Sidebar + Center Scrollable Canvas + Right Field Inspector */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            overflow: "hidden",
            borderRadius: 2.5,
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          {/* Left Signer Role Sidebar */}
          <SignerRoleSidebar roles={signerRoles} loading={rolesLoading} />

          {/* Center PDF Viewer Canvas Area */}
          <Box
            ref={scrollContainerRef}
            sx={{
              flexGrow: 1,
              bgcolor: "#F1F5F9",
              overflowY: "auto",
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {docLoading || fieldsLoading || !pdfBlobUrl ? (
              <Box sx={{ textAlign: "center", pt: 12 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: "#64748B" }}>
                  Loading PDF Document...
                </Typography>
              </Box>
            ) : (
              <Document
                file={pdfBlobUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                loading={<CircularProgress size={40} sx={{ m: 4 }} />}
              >
                {Array.from(new Array(numPages), (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <PdfPageCanvas
                      key={`page_${pageNum}`}
                      pageNumber={pageNum}
                      scale={scale}
                      fields={placedFields}
                      selectedFieldId={selectedField?.tempId}
                      onSelectField={(f) => setSelectedField(f)}
                      onAddField={handleAddField}
                      onUpdateField={handleUpdateField}
                      onDeleteField={handleDeleteField}
                    />
                  );
                })}
              </Document>
            )}
          </Box>

          {/* Right Field Inspector Sidebar */}
          {/* <Box
            sx={{
              width: 280,
              minWidth: 280,
              bgcolor: "#FFFFFF",
              borderLeft: "1px solid #E5E7EB",
              p: 2.5,
              overflowY: "auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SettingsOutlinedIcon sx={{ color: "#1976D2", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
                Field Inspector
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />

            {selectedField ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Signer Role
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976D2" }}>
                    {selectedField.roleName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Page Assignment
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Page {selectedField.pageNumber} of {numPages}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Position (X / Y %)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    X: {selectedField.xPosition}% | Y: {selectedField.yPosition}%
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    Size (Width / Height %)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    W: {selectedField.width}% | H: {selectedField.height}%
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Required Field
                  </Typography>
                  <Switch
                    checked={selectedField.required}
                    onChange={(e) => handleUpdateField({ ...selectedField, required: e.target.checked })}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<DeleteOutlinedIcon />}
                  onClick={() => handleDeleteField(selectedField.tempId)}
                  sx={{ borderRadius: 2 }}
                >
                  Delete Signature Field
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 5, color: "#94A3B8" }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Click on any placed signature box in the PDF viewer to inspect and configure its properties.
                </Typography>
              </Box>
            )}
          </Box> */}
        </Box>
      </Box>

      {/* Edit Name & Status Dialog */}
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
