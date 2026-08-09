import React, { useState } from "react";
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
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import toast from "react-hot-toast";

import { adminApi } from "../../api/admin.api";
import type { CreateUserPayload, UpdateUserPayload, UserItem } from "../../types/user.types";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/formatters";
import { UserFormModal } from "./UserForm";

export const Users: React.FC = () => {
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

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<UserItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["users", page + 1, pageSize, debouncedSearchText, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      adminApi.getUsers({
        page: page + 1,
        limit: pageSize,
        searchText: debouncedSearchText || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
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

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user accounts, roles, permissions, and password resets
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
            startIcon={<PersonAddOutlinedIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2 }}
          >
            Create New User
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
              placeholder="Search by name or email..."
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
                <MenuItem value="">All Users</MenuItem>
                <MenuItem value="Active">Active Users</MenuItem>
                <MenuItem value="Inactive">Inactive Users</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "full_name"}
                      direction={sortBy === "full_name" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("full_name")}
                    >
                      Full Name & Email
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
                  <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "created_at"}
                      direction={sortBy === "created_at" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("created_at")}
                    >
                      Created Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      No user accounts match the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u: UserItem) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ color: "text.secondary" }}>#{u.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#1976D2", width: 34, height: 34, fontSize: "0.875rem", fontWeight: 600 }}>
                            {u.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {u.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {u.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.status}
                          size="small"
                          color={u.status === "Active" ? "success" : "default"}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(u.last_login)}</TableCell>
                      <TableCell>{formatDate(u.created_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setActionMenuAnchor(e.currentTarget);
                            setMenuUser(u);
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
              `${from}–${to} of ${count} users (Page ${page + 1} of ${Math.ceil(count / pageSize) || 1})`
            }
          />
        </CardContent>
      </Card>

      {/* Row Action Dropdown Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
        slotProps={{ paper: { elevation: 2, sx: { minWidth: 180, borderRadius: 2 } } }}
      >
        <MenuItem
          onClick={() => {
            if (menuUser) handleOpenEdit(menuUser);
            setActionMenuAnchor(null);
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit User & Password
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) handleOpenDelete(menuUser);
            setActionMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: "error.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Delete User
          </Typography>
        </MenuItem>
      </Menu>

      {/* Create / Edit Form Modal */}
      <UserFormModal
        open={formOpen}
        userToEdit={selectedUser}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${userToDelete?.full_name || userToDelete?.email}"? This action cannot be undone.`}
        confirmText="Delete User"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};
