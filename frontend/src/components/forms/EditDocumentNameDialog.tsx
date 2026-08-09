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
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import type { DocumentStatus } from "../../types/document.types";
import { DOCUMENT_STATUS_OPTIONS } from "../../constants/appConstants";

const schema = z.object({
  documentName: z.string().trim().min(1, "Document name is required").max(255),
  status: z.enum(["Draft", "In Progress", "Completed", "Archived"]),
});

type FormValues = z.infer<typeof schema>;

interface EditDocumentDialogProps {
  open: boolean;
  currentName: string;
  currentStatus?: DocumentStatus;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (newName: string, newStatus: DocumentStatus) => Promise<void>;
}

export const EditDocumentNameDialog: React.FC<EditDocumentDialogProps> = ({
  open,
  currentName,
  currentStatus = "Draft",
  loading = false,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentName: "",
      status: "Draft",
    },
  });

  useEffect(() => {
    reset({
      documentName: currentName,
      status: currentStatus,
    });
  }, [currentName, currentStatus, open, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit(data.documentName, data.status as DocumentStatus);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Document Details & Status</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Controller
              name="documentName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Document Name"
                  placeholder="e.g. Non-Disclosure Agreement 2026"
                  error={!!errors.documentName}
                  helperText={errors.documentName?.message}
                  autoFocus
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
                  label="Document Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
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
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
