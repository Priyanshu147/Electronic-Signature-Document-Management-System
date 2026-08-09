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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
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
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentName: "",
      status: "Draft",
    },
  });

  const selectedStatus = watch("status");

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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Document Details</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Document Name"
                {...register("documentName")}
                error={!!errors.documentName}
                helperText={errors.documentName?.message}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="edit-doc-status-label">Document Status</InputLabel>
                <Select
                  labelId="edit-doc-status-label"
                  label="Document Status"
                  value={selectedStatus || "Draft"}
                  onChange={(e) => setValue("status", e.target.value as DocumentStatus)}
                >
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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
