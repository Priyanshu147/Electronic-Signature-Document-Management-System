import React, { useState } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

import { adminApi } from "../../api/admin.api";
import type { CreateUserPayload, UpdateUserPayload, UserItem } from "../../types/user.types";
import { PageHeader } from "../../components/common/PageHeader";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { formatDate } from "../../utils/formatters";
import { UserFormModal } from "./UserForm";

export const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", page, pageSize, searchText, statusFilter],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit: pageSize,
        searchText: searchText || undefined,
        status: statusFilter || undefined,
      }),
  });

  const users = data?.users || [];
  const totalCount = data?.total || 0;

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
    onSuccess: (res) => {
      toast.success(res.message || "User created successfully!");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create user.");
    },
  });

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      adminApi.updateUser(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || "User updated successfully!");
      setFormOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user.");
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: (res) => {
      toast.success(res.message || "User deleted successfully!");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user.");
    },
  });

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleOpenDelete = (user: UserItem) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (payload: CreateUserPayload | UpdateUserPayload) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        payload: payload as UpdateUserPayload,
      });
    } else {
      await createMutation.mutateAsync(payload as CreateUserPayload);
    }
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteMutation.mutateAsync(userToDelete.id);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "full_name",
      headerName: "Full Name",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "email",
      headerName: "Email Address",
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const isAct = params.value === "Active";
        return (
          <Chip
            label={String(params.value || "")}
            color={isAct ? "success" : "default"}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "last_login",
      headerName: "Last Login",
      width: 170,
      valueFormatter: (value: any) => formatDate(value as string),
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 170,
      valueFormatter: (value: any) => formatDate(value as string),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const userRow = params.row as UserItem;
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenEdit(userRow)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDelete(userRow)}
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
        title="Users Management"
        subtitle="View, create, edit and delete system users"
        actionText="Create User"
        actionIcon={<AddIcon />}
        onAction={handleOpenCreate}
      />

      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          {/* Filters Bar */}
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
              placeholder="Search by name or email..."
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
              <InputLabel id="status-filter-label">Filter Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Filter Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as string);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* DataGrid */}
          <Box sx={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={users}
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

      {/* User Create/Edit Modal */}
      <UserFormModal
        open={formOpen}
        userToEdit={selectedUser}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* User Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.full_name || userToDelete?.email}"? This action cannot be undone.`}
        confirmText="Delete User"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};
