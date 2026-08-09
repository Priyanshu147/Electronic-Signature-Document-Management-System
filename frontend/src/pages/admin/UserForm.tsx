import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Grid,
} from "@mui/material";
import type { CreateUserPayload, UpdateUserPayload, UserItem, UserStatus } from "../../types/user.types";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required (min 2 characters)"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(["Active", "Inactive"]),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = {
  fullName: string;
  email: string;
  password?: string;
  status: UserStatus;
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
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      status: "Active",
    },
  });

  const selectedStatus = watch("status");

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
        {isEditing ? "Edit User" : "Create New User"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            {!isEditing && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="user-status-label">Account Status</InputLabel>
                <Select
                  labelId="user-status-label"
                  label="Account Status"
                  value={selectedStatus || "Active"}
                  onChange={(e) => setValue("status", e.target.value as UserStatus)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
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
