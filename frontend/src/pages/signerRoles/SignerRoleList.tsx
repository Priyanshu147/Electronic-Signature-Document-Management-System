import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

import { signerRoleApi } from "../../api/signerRole.api";
import type { CreateSignerRolePayload, SignerRoleItem, UpdateSignerRolePayload } from "../../types/signerRole.types";
import { PageHeader } from "../../components/common/PageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { SignerRoleFormModal } from "./SignerRoleForm";

export const SignerRoleList: React.FC = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<SignerRoleItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<SignerRoleItem | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["signerRoles"],
    queryFn: () => signerRoleApi.getSignerRoles(),
  });

  const roles = data?.data || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateSignerRolePayload) =>
      signerRoleApi.createSignerRole(payload),
    onSuccess: () => {
      toast.success("Signer role created successfully!");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["signerRoles"] });
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
      setModalOpen(false);
      setSelectedRole(null);
      queryClient.invalidateQueries({ queryKey: ["signerRoles"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update signer role.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => signerRoleApi.deleteSignerRole(id),
    onSuccess: (res: { success: boolean; message: string }) => {
      toast.success(res.message || "Signer role deleted successfully!");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["signerRoles"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete signer role.");
    },
  });

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: SignerRoleItem) => {
    setSelectedRole(role);
    setModalOpen(true);
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

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "role_name",
      headerName: "Role Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 250,
      valueGetter: (value: any) => value || "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const roleRow = params.row as SignerRoleItem;
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit Role">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenEdit(roleRow)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Role">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDelete(roleRow)}
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
        title="Signer Roles"
        subtitle="Manage custom signer roles for document signature fields"
        actionText="Create Signer Role"
        actionIcon={<AddIcon />}
        onAction={handleOpenCreate}
      />

      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ height: 480, width: "100%" }}>
            <DataGrid
              rows={roles}
              columns={columns}
              loading={isLoading || isFetching}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
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

      {/* Create/Edit Modal */}
      <SignerRoleFormModal
        open={modalOpen}
        roleToEdit={selectedRole}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Signer Role"
        message={`Are you sure you want to delete the signer role "${roleToDelete?.role_name}"?`}
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
