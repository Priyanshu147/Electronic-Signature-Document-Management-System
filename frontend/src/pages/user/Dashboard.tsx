import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "../../hooks/useAuth";
import { documentApi } from "../../api/document.api";
import { signerRoleApi } from "../../api/signerRole.api";
import { PageHeader } from "../../components/common/PageHeader";
import { formatDate } from "../../utils/formatters";
import type { DocumentItem } from "../../types/document.types";

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: docsData } = useQuery({
    queryKey: ["userDocumentsSummary"],
    queryFn: () => documentApi.getDocuments({ page: 1, limit: 5 }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ["userSignerRolesSummary"],
    queryFn: () => signerRoleApi.getSignerRoles(),
  });

  const totalDocs = docsData?.pagination?.totalRecords || 0;
  const totalRoles = rolesData?.data?.length || 0;

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.fullName || "User"}!`}
        subtitle="Manage your electronic signature documents and signer workflows"
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate("/user/documents/upload")}
          sx={{ borderRadius: 2, px: 2.5, py: 1 }}
        >
          Upload Document
        </Button>
      </PageHeader>

      {/* User Profile Card Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "white",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#6366f1",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {user?.fullName || "User Account"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
              <Chip
                icon={<CheckCircleIcon style={{ color: "#4ade80" }} />}
                label={user?.status || "Active"}
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.15)", color: "white", fontWeight: 600 }}
              />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Last Login: {formatDate(user?.lastLogin)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="outlined"
          sx={{
            color: "white",
            borderColor: "rgba(255,255,255,0.4)",
            "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
          }}
          startIcon={<PersonIcon />}
          onClick={() => navigate("/user/profile")}
        >
          View Profile
        </Button>
      </Paper>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    My Documents
                  </Typography>
                  <Typography variant="h3" color="primary.main" sx={{ my: 0.5, fontWeight: 800 }}>
                    {totalDocs}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", width: 56, height: 56 }}>
                  <DescriptionIcon fontSize="large" />
                </Avatar>
              </Box>
              <Button
                size="small"
                onClick={() => navigate("/user/documents")}
                sx={{ mt: 1, p: 0, textTransform: "none", fontWeight: 600 }}
              >
                View all documents →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Signer Roles
                  </Typography>
                  <Typography variant="h3" color="secondary.main" sx={{ my: 0.5, fontWeight: 800 }}>
                    {totalRoles}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.main", width: 56, height: 56 }}>
                  <BadgeIcon fontSize="large" />
                </Avatar>
              </Box>
              <Button
                size="small"
                color="secondary"
                onClick={() => navigate("/user/signer-roles")}
                sx={{ mt: 1, p: 0, textTransform: "none", fontWeight: 600 }}
              >
                Manage signer roles →
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<UploadFileIcon />}
                  onClick={() => navigate("/user/documents/upload")}
                  sx={{ justifyContent: "flex-start", borderRadius: 2 }}
                >
                  Upload New PDF
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<BadgeIcon />}
                  onClick={() => navigate("/user/signer-roles")}
                  sx={{ justifyContent: "flex-start", borderRadius: 2 }}
                >
                  Create Signer Role
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Documents Section */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recent Uploads
            </Typography>
            <Button size="small" onClick={() => navigate("/user/documents")}>
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {docsData?.documents && docsData.documents.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {docsData.documents.slice(0, 5).map((doc: DocumentItem) => (
                <Paper
                  key={doc.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <DescriptionIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {doc.document_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.original_file_name} • {formatDate(doc.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/user/documents/${doc.id}/editor`)}
                  >
                    Edit Signatures
                  </Button>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No documents uploaded yet. Click "Upload Document" to get started.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
