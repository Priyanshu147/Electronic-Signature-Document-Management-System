import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import type { CreateSignerRolePayload, SignerRoleItem, UpdateSignerRolePayload } from "../../types/signerRole.types";

const schema = z.object({
  roleName: z.string().trim().min(1, "Role name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SignerRoleFormModalProps {
  open: boolean;
  roleToEdit?: SignerRoleItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSignerRolePayload | UpdateSignerRolePayload) => Promise<void>;
}

export const SignerRoleFormModal: React.FC<SignerRoleFormModalProps> = ({
  open,
  roleToEdit,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!roleToEdit;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleName: "",
      description: "",
    },
  });

  useEffect(() => {
    if (roleToEdit) {
      reset({
        roleName: roleToEdit.role_name,
        description: roleToEdit.description || "",
      });
    } else {
      reset({
        roleName: "",
        description: "",
      });
    }
  }, [roleToEdit, open, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit({
      roleName: data.roleName,
      description: data.description || "",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Edit Signer Role" : "Create New Signer Role"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Controller
              name="roleName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Role Name"
                  placeholder="e.g. Buyer, Seller, Witness, Approver"
                  error={!!errors.roleName}
                  helperText={errors.roleName?.message}
                  autoFocus
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="Description (Optional)"
                  placeholder="Describe the responsibility or authority of this signer role"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
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
            {isEditing ? "Update Role" : "Create Role"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
