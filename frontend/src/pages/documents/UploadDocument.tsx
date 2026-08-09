import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import toast from "react-hot-toast";

import { documentApi } from "../../api/document.api";
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
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documentName: "",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
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
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setValue("documentName", fileNameWithoutExt, { shouldValidate: true });
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
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["userDocumentsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
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
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => navigate("/user/documents")} size="small" sx={{ border: "1px solid #E5E7EB" }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Upload PDF Document
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a PDF document to prepare signature fields and signer roles
          </Typography>
        </Box>
      </Box>

      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* File Dropzone Area */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                Select PDF Document
              </Typography>

              {selectedFile ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: "2px solid #1976D2",
                    bgcolor: "#EFF6FF",
                    textAlign: "center",
                  }}
                >
                  <PictureAsPdfOutlinedIcon sx={{ fontSize: 48, color: "#DC2626", mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Size: {formatBytes(selectedFile.size)} • PDF Document
                  </Typography>
                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={() => setSelectedFile(null)}
                    sx={{ mt: 1.5 }}
                  >
                    Remove Selected File
                  </Button>
                </Box>
              ) : (
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4,
                    borderRadius: 2.5,
                    border: "2px dashed",
                    borderColor: fileError ? "error.main" : "#CBD5E1",
                    bgcolor: "#F8FAFC",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: "#1976D2",
                      bgcolor: "#EFF6FF",
                    },
                  }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: "#1976D2", mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Click or drag PDF file to this area to upload
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

            {/* Document Name */}
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
                />
              )}
            />

            {uploading && <LinearProgress sx={{ mt: 3, borderRadius: 1 }} />}

            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/user/documents")}
                disabled={uploading}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={uploading || !selectedFile}
                startIcon={<CloudUploadOutlinedIcon />}
                sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
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
