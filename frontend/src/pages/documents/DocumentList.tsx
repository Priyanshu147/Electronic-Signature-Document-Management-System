import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

import { documentApi } from "../../api/document.api";
import type { DocumentItem, DocumentStatus } from "../../types/document.types";
import { PageHeader } from "../../components/common/PageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EditDocumentNameDialog } from "../../components/forms/EditDocumentNameDialog";
import { formatBytes, formatDate } from "../../utils/formatters";

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [docToRename, setDocToRename] = useState<DocumentItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["documents", page, pageSize, searchText, statusFilter],
    queryFn: () =>
      documentApi.getDocuments({
        page,
        limit: pageSize,
        searchText: searchText || undefined,
        status: statusFilter || undefined,
      }),
  });

  const documents = data?.documents || [];
  const totalCount = data?.pagination?.totalRecords || 0;

  // Edit/Rename Document Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, name, status }: { id: number; name: string; status?: DocumentStatus }) =>
      documentApi.updateDocument(id, name, status),
    onSuccess: () => {
      toast.success("Document updated successfully!");
      setRenameDialogOpen(false);
      setDocToRename(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update document.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentApi.deleteDocument(id),
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      setDeleteDialogOpen(false);
      setDocToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete document.");
    },
  });

  const handleDownload = async (doc: DocumentItem) => {
    try {
      toast.loading("Preparing download...", { id: "downloading" });
      const blob = await documentApi.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.document_name.endsWith(".pdf")
        ? doc.document_name
        : `${doc.document_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Document downloaded successfully!", { id: "downloading" });
    } catch (err: any) {
      toast.error(err.message || "Failed to download document.", { id: "downloading" });
    }
  };

  const getStatusChipColor = (status: DocumentStatus) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "primary";
      case "Draft":
        return "warning";
      case "Archived":
        return "default";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    {
      field: "document_name",
      headerName: "Document Name",
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "uploaded_by",
      headerName: "Uploaded By",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "created_at",
      headerName: "Uploaded Date",
      width: 160,
      valueFormatter: (value: any) => formatDate(value as string),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Click to edit status or details">
          <Chip
            label={String(params.value || "")}
            color={getStatusChipColor(params.value as DocumentStatus)}
            size="small"
            variant="outlined"
            onClick={() => {
              setDocToRename(params.row as DocumentItem);
              setRenameDialogOpen(true);
            }}
            sx={{ fontWeight: 600, cursor: "pointer" }}
          />
        </Tooltip>
      ),
    },
    {
      field: "page_count",
      headerName: "Pages",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "file_size",
      headerName: "File Size",
      width: 100,
      valueFormatter: (value: any) => formatBytes(value as number),
    },
    {
      field: "number_of_signers",
      headerName: "Signers",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 230,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const docRow = params.row as DocumentItem;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/user/documents/${docRow.id}/editor`)}
              sx={{
                borderRadius: 1.5,
                fontWeight: 600,
                textTransform: "none",
                py: 0.4,
                px: 1.5,
                fontSize: "0.8125rem",
              }}
            >
              Edit
            </Button>
            <Tooltip title="Edit Document Details & Status">
              <IconButton
                size="small"
                color="info"
                onClick={() => {
                  setDocToRename(docRow);
                  setRenameDialogOpen(true);
                }}
              >
                <DriveFileRenameOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download PDF">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleDownload(docRow)}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Document">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setDocToDelete(docRow);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Document Management"
        subtitle="Manage and edit your uploaded electronic signature documents"
        actionText="Upload PDF"
        actionIcon={<UploadFileIcon />}
        onAction={() => navigate("/user/documents/upload")}
      />

      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          {/* Filters */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
              justifyContent: "space-between",
            }}
          >
            <TextField
              placeholder="Search document or file name..."
              size="small"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 280 }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="doc-status-filter-label">Filter Status</InputLabel>
              <Select
                labelId="doc-status-filter-label"
                label="Filter Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as string);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* DataGrid */}
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={documents}
              columns={columns}
              rowCount={totalCount}
              loading={isLoading || isFetching}
              paginationMode="server"
              paginationModel={{ page: page - 1, pageSize }}
              onPaginationModelChange={(model: GridPaginationModel) => {
                setPage(model.page + 1);
                setPageSize(model.pageSize);
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: "none",
                "& .MuiDataGrid-cell:focus": { outline: "none" },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Edit Details & Status Dialog */}
      {docToRename && (
        <EditDocumentNameDialog
          open={renameDialogOpen}
          currentName={docToRename.document_name}
          currentStatus={docToRename.status}
          loading={updateMutation.isPending}
          onClose={() => setRenameDialogOpen(false)}
          onSubmit={async (newName, newStatus) => {
            await updateMutation.mutateAsync({ id: docToRename.id, name: newName, status: newStatus });
          }}
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Document"
        message={`Are you sure you want to delete document "${docToDelete?.document_name}"? This action cannot be undone.`}
        confirmText="Delete Document"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (docToDelete) {
            await deleteMutation.mutateAsync(docToDelete.id);
          }
        }}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};
