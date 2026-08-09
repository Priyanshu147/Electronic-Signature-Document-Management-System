import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Menu,
  Avatar,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import EditIcon from "@mui/icons-material/Edit";
import toast from "react-hot-toast";

import { documentApi } from "../../api/document.api";
import type { DocumentItem, DocumentStatus } from "../../types/document.types";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EditDocumentNameDialog } from "../../components/forms/EditDocumentNameDialog";
import { useDebounce } from "../../hooks/useDebounce";
import { formatBytes, formatDate } from "../../utils/formatters";

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearchText = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
  const [docToRename, setDocToRename] = useState<DocumentItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuDoc, setMenuDoc] = useState<DocumentItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["documents", page + 1, pageSize, debouncedSearchText, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      documentApi.getDocuments({
        page: page + 1,
        limit: pageSize,
        searchText: debouncedSearchText || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const documents = data?.documents || [];
  const totalCount = data?.pagination?.totalRecords || 0;

  // Edit Document Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, name, status }: { id: number; name: string; status?: DocumentStatus }) =>
      documentApi.updateDocument(id, name, status),
    onSuccess: () => {
      toast.success("Document updated successfully!");
      setRenameDialogOpen(false);
      setDocToRename(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["userDocumentsSummary"] });
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
      queryClient.invalidateQueries({ queryKey: ["userDocumentsSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete document.");
    },
  });

  const handleDownload = async (doc: DocumentItem) => {
    try {
      toast.loading("Preparing PDF download...", { id: "downloading" });
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
      toast.success("Document downloaded with signature boxes!", { id: "downloading" });
    } catch (err: any) {
      toast.error(err.message || "Failed to download document.", { id: "downloading" });
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
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

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Document Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, upload, download, and configure electronic signature fields on PDF documents
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title="Refresh List">
            <IconButton onClick={() => refetch()} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={() => navigate("/user/documents/upload")}
            sx={{ borderRadius: 2 }}
          >
            Upload PDF Document
          </Button>
        </Box>
      </Box>

      {/* Main Table Card */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          {/* Filters Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search document name..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(0);
              }}
              sx={{ width: 300 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
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

          {/* Table */}
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "document_name"}
                      direction={sortBy === "document_name" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("document_name")}
                    >
                      Document Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "uploaded_by"}
                      direction={sortBy === "uploaded_by" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("uploaded_by")}
                    >
                      Uploaded By
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "status"}
                      direction={sortBy === "status" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "created_at"}
                      direction={sortBy === "created_at" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("created_at")}
                    >
                      Uploaded Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Pages</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "file_size"}
                      direction={sortBy === "file_size" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("file_size")}
                    >
                      File Size
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "number_of_signers"}
                      direction={sortBy === "number_of_signers" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("number_of_signers")}
                    >
                      Signers
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      No documents match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc: DocumentItem) => (
                    <TableRow key={doc.id} hover>
                      {/* Document Name */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#EFF6FF", color: "#1976D2", width: 36, height: 36, borderRadius: 2 }}>
                            <PictureAsPdfOutlinedIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {doc.document_name}
                            </Typography>
                            {doc.original_file_name && (
                              <Typography variant="caption" color="text.secondary">
                                {doc.original_file_name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Dedicated Uploaded By Column */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ bgcolor: "#F3F4F6", color: "#4B5563", width: 28, height: 28, fontSize: "0.75rem", fontWeight: 600 }}>
                            {(doc.uploaded_by || "U").charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: "#374151" }}>
                            {doc.uploaded_by || "System User"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Tooltip title="Click to edit document status">
                          <Chip
                            label={doc.status}
                            size="small"
                            color={getStatusColor(doc.status) as any}
                            onClick={() => {
                              setDocToRename(doc);
                              setRenameDialogOpen(true);
                            }}
                            sx={{ fontWeight: 600, cursor: "pointer" }}
                          />
                        </Tooltip>
                      </TableCell>

                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell align="center">{doc.page_count || 1}</TableCell>
                      <TableCell>{formatBytes(doc.file_size)}</TableCell>
                      <TableCell align="center">{doc.number_of_signers || 0}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => navigate(`/user/documents/${doc.id}/editor`)}
                            sx={{ borderRadius: 1.5, py: 0.5, px: 1.5 }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setActionMenuAnchor(e.currentTarget);
                              setMenuDoc(doc);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} of ${count} documents (Page ${page + 1} of ${Math.ceil(count / pageSize) || 1})`
            }
          />
        </CardContent>
      </Card>

      {/* Row Actions Dropdown Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
        slotProps={{ paper: { elevation: 2, sx: { minWidth: 180, borderRadius: 2 } } }}
      >
        <MenuItem
          onClick={() => {
            if (menuDoc) {
              setDocToRename(menuDoc);
              setRenameDialogOpen(true);
            }
            setActionMenuAnchor(null);
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit Name & Status
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuDoc) handleDownload(menuDoc);
            setActionMenuAnchor(null);
          }}
        >
          <DownloadOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Download PDF
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuDoc) {
              setDocToDelete(menuDoc);
              setDeleteDialogOpen(true);
            }
            setActionMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "error.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Delete Document
          </Typography>
        </MenuItem>
      </Menu>

      {/* Edit Name & Status Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
