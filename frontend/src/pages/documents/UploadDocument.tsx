import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

import { documentApi } from "../../api/document.api";
import { PageHeader } from "../../components/common/PageHeader";
import { MAX_FILE_SIZE } from "../../constants/appConstants";
import { formatBytes } from "../../utils/formatters";

const uploadSchema = z.object({
  documentName: z
    .string()
    .trim()
    .min(1, "Document name is required")
    .max(255, "Document name must not exceed 255 characters"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export const UploadDocument: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documentName: "",
    },
  });

  const handleFileSelect = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds 5MB limit (${formatBytes(file.size)}).`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Auto fill document name if empty
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setValue("documentName", fileNameWithoutExt, { shouldValidate: true });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!selectedFile) {
      setFileError("Please select a PDF file to upload.");
      return;
    }

    setUploading(true);
    try {
      const res = await documentApi.uploadDocument(selectedFile, data.documentName);
      toast.success(res.message || "Document uploaded successfully!");
      if (res.data?.id) {
        navigate(`/user/documents/${res.data.id}/editor`);
      } else {
        navigate("/user/documents");
      }
    } catch (err: any) {
      toast.error(err.message || "Document upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Upload PDF Document"
        subtitle="Upload a PDF document to prepare signature fields"
      />

      <Card sx={{ maxWidth: 700, mx: "auto", borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* File Dropzone */}
            <Box
              component="label"
              onDragOver={(e: React.DragEvent) => e.preventDefault()}
              onDrop={handleDrop}
              sx={{
                display: "block",
                p: 4,
                mb: 3,
                textAlign: "center",
                borderRadius: 3,
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: fileError ? "error.main" : selectedFile ? "primary.main" : "grey.400",
                backgroundColor: selectedFile ? "action.hover" : "background.paper",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <input
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <PictureAsPdfIcon color="error" sx={{ fontSize: 56, mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {formatBytes(selectedFile.size)} • PDF Document
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Remove File
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <CloudUploadIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Drag & Drop PDF here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    or click to browse files from your device
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supported format: PDF only • Maximum size: 5MB
                  </Typography>
                </Box>
              )}
            </Box>

            {fileError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {fileError}
              </Alert>
            )}

            {/* Document Name Input */}
            <TextField
              fullWidth
              label="Document Name"
              placeholder="e.g. Non-Disclosure Agreement 2026"
              {...register("documentName")}
              error={!!errors.documentName}
              helperText={errors.documentName?.message}
              sx={{ mb: 3 }}
            />

            {uploading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/user/documents")}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={uploading || !selectedFile}
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                sx={{ px: 4, py: 1.2, fontWeight: 700 }}
              >
                {uploading ? "Uploading PDF..." : "Upload & Prepare Signatures"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
