import React, { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import type { CreateUserPayload, UpdateUserPayload, UserItem } from "../../types/user.types";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required (min 2 characters)"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(["Active", "Inactive"]),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters if provided",
    }),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = {
  fullName: string;
  email: string;
  password?: string;
  status: "Active" | "Inactive";
};

interface UserFormProps {
  open: boolean;
  userToEdit?: UserItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormProps> = ({
  open,
  userToEdit,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!userToEdit;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as Resolver<FormValues>,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        fullName: userToEdit.full_name,
        email: userToEdit.email,
        password: "",
        status: userToEdit.status,
      });
    } else {
      reset({
        fullName: "",
        email: "",
        password: "",
        status: "Active",
      });
    }
  }, [userToEdit, open, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    if (isEditing) {
      await onSubmit({
        fullName: data.fullName,
        email: data.email,
        status: data.status,
        password: data.password && data.password.trim() ? data.password : undefined,
      });
    } else {
      await onSubmit({
        fullName: data.fullName,
        email: data.email,
        password: data.password || "",
        status: data.status,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Edit User & Password" : "Create New User"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Full Name"
                  placeholder="John Doe"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="email"
                  label="Email Address"
                  placeholder="john@company.com"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label={isEditing ? "Reset Password (Optional)" : "Password"}
                  placeholder="••••••••"
                  error={!!errors.password}
                  helperText={
                    errors.password?.message ||
                    (isEditing ? "Enter a new password only if you want to reset this user's password." : undefined)
                  }
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Account Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
