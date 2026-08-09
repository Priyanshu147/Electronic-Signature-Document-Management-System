import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { documentApi } from "../../api/document.api";
import { signerRoleApi } from "../../api/signerRole.api";
import { formatDate } from "../../utils/formatters";
import type { DocumentItem } from "../../types/document.types";

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ["userDocumentsSummary"],
    queryFn: () => documentApi.getDocuments({ page: 1, limit: 5 }),
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["userSignerRolesSummary"],
    queryFn: () => signerRoleApi.getSignerRoles(),
  });

  const totalDocs = docsData?.pagination?.totalRecords || 0;
  const totalRoles = rolesData?.data?.length || 0;
  const recentDocs = docsData?.documents || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "primary";
      case "Draft":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Top Banner Card */}
      {/* <Card
        elevation={0}
        sx={{
          mb: 3.5,
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          borderRadius: 3,
          p: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#1976D2",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#FFFFFF", mb: 0.5 }}>
                  Welcome back, {user?.fullName || "User"}!
                </Typography>
                <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                  {user?.email}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <Chip
                    icon={<CheckCircleOutlinedIcon style={{ color: "#4ADE80", fontSize: 16 }} />}
                    label={user?.status || "Active Workspace"}
                    size="small"
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.15)", color: "#FFFFFF", fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => navigate("/user/documents/upload")}
              sx={{
                bgcolor: "#1976D2",
                px: 3,
                py: 1.25,
                borderRadius: 2,
                fontWeight: 600,
                "&:hover": { bgcolor: "#1565C0" },
              }}
            >
              Upload PDF Document
            </Button>
          </Box>
        </CardContent>
      </Card> */}

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    My Documents
                  </Typography>
                  {docsLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1, display: "block" }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#1F2937", my: 0.5 }}>
                      {totalDocs}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: "#EFF6FF", color: "#1976D2", width: 48, height: 48, borderRadius: 2.5 }}>
                  <DescriptionOutlinedIcon />
                </Avatar>
              </Box>
              <Button
                size="small"
                onClick={() => navigate("/user/documents")}
                sx={{ mt: 2, p: 0, fontWeight: 600 }}
              >
                View all documents →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Signer Roles
                  </Typography>
                  {rolesLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1, display: "block" }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#7C3AED", my: 0.5 }}>
                      {totalRoles}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: "#F3E8FF", color: "#7C3AED", width: 48, height: 48, borderRadius: 2.5 }}>
                  <BadgeOutlinedIcon />
                </Avatar>
              </Box>
              <Button
                size="small"
                onClick={() => navigate("/user/signer-roles")}
                sx={{ mt: 2, p: 0, fontWeight: 600, color: "#7C3AED" }}
              >
                Manage signer roles →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadOutlinedIcon />}
                  onClick={() => navigate("/user/documents/upload")}
                  sx={{ justifyContent: "flex-start", borderRadius: 2, py: 1 }}
                >
                  Upload New PDF
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<BadgeOutlinedIcon />}
                  onClick={() => navigate("/user/signer-roles")}
                  sx={{ justifyContent: "flex-start", borderRadius: 2, py: 1 }}
                >
                  Create Signer Role
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Documents Table */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recent Documents
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon fontSize="small" />}
              onClick={() => navigate("/user/documents")}
            >
              View All
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : recentDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No documents uploaded yet. Click "Upload PDF Document" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentDocs.slice(0, 5).map((doc: DocumentItem) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#EFF6FF", color: "#1976D2", width: 36, height: 36, borderRadius: 2 }}>
                            <DescriptionOutlinedIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {doc.document_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.original_file_name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.status}
                          size="small"
                          color={getStatusColor(doc.status) as any}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon fontSize="small" />}
                          onClick={() => navigate(`/user/documents/${doc.id}/editor`)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          Edit Signatures
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
