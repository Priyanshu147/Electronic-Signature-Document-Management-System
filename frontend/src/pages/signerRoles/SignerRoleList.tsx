import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import toast from "react-hot-toast";

import { signerRoleApi } from "../../api/signerRole.api";
import type { CreateSignerRolePayload, SignerRoleItem, UpdateSignerRolePayload } from "../../types/signerRole.types";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { SignerRoleFormModal } from "./SignerRoleForm";

export const SignerRoleList: React.FC = () => {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<SignerRoleItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<SignerRoleItem | null>(null);

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRole, setMenuRole] = useState<SignerRoleItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["signerRolesList"],
    queryFn: () => signerRoleApi.getSignerRoles(),
  });

  const roles = data?.data || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateSignerRolePayload) => signerRoleApi.createSignerRole(payload),
    onSuccess: () => {
      toast.success("Signer role created successfully!");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["signerRolesList"] });
      queryClient.invalidateQueries({ queryKey: ["userSignerRolesSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create signer role.");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSignerRolePayload }) =>
      signerRoleApi.updateSignerRole(id, payload),
    onSuccess: () => {
      toast.success("Signer role updated successfully!");
      setFormOpen(false);
      setSelectedRole(null);
      queryClient.invalidateQueries({ queryKey: ["signerRolesList"] });
      queryClient.invalidateQueries({ queryKey: ["userSignerRolesSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update signer role.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => signerRoleApi.deleteSignerRole(id),
    onSuccess: () => {
      toast.success("Signer role deleted successfully!");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["signerRolesList"] });
      queryClient.invalidateQueries({ queryKey: ["userSignerRolesSummary"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete signer role.");
    },
  });

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (role: SignerRoleItem) => {
    setSelectedRole(role);
    setFormOpen(true);
  };

  const handleOpenDelete = (role: SignerRoleItem) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (payload: CreateSignerRolePayload | UpdateSignerRolePayload) => {
    if (selectedRole) {
      await updateMutation.mutateAsync({
        id: selectedRole.id,
        payload: payload as UpdateSignerRolePayload,
      });
    } else {
      await createMutation.mutateAsync(payload as CreateSignerRolePayload);
    }
  };

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Signer Roles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define custom signer roles (e.g. Buyer, Seller, Approver) to drag and drop onto PDFs
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
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2 }}
          >
            Create Signer Role
          </Button>
        </Box>
      </Box>

      {/* Main Table Card */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Role ID</TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      No signer roles defined yet. Click "Create Signer Role" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((r: SignerRoleItem) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ color: "text.secondary" }}>#{r.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#F3E8FF", color: "#7C3AED", width: 36, height: 36, borderRadius: 2 }}>
                            <BadgeOutlinedIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {r.role_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: r.description ? "text.primary" : "text.secondary" }}>
                        {r.description || "—"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setActionMenuAnchor(e.currentTarget);
                            setMenuRole(r);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
        slotProps={{ paper: { elevation: 2, sx: { minWidth: 160, borderRadius: 2 } } }}
      >
        <MenuItem
          onClick={() => {
            if (menuRole) handleOpenEdit(menuRole);
            setActionMenuAnchor(null);
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit Role
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRole) handleOpenDelete(menuRole);
            setActionMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "error.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Delete Role
          </Typography>
        </MenuItem>
      </Menu>

      {/* Create / Edit Modal */}
      <SignerRoleFormModal
        open={formOpen}
        roleToEdit={selectedRole}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Signer Role"
        message={`Are you sure you want to delete signer role "${roleToDelete?.role_name}"?`}
        confirmText="Delete Role"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (roleToDelete) {
            await deleteMutation.mutateAsync(roleToDelete.id);
          }
        }}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};
