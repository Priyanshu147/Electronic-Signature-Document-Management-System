import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Alert,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { adminApi } from "../../api/admin.api";
import { PageHeader } from "../../components/common/PageHeader";
import { CardLoadingSkeleton } from "../../components/common/LoadingSkeleton";

export const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const stats = data?.data || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      icon: <PeopleIcon sx={{ fontSize: 32, color: "white" }} />,
      description: "Registered platform users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      color: "#10b981",
      bgGradient: "gradient(135deg, #10b981 0%, #047857 100%)",
      icon: <CheckCircleIcon sx={{ fontSize: 32, color: "white" }} />,
      description: "Users with active status",
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      icon: <CancelIcon sx={{ fontSize: 32, color: "white" }} />,
      description: "Suspended or deactivated accounts",
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="System user statistics and platform overview"
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }} action={<button onClick={() => refetch()}>Retry</button>}>
          {(error as Error)?.message || "Failed to load dashboard statistics."}
        </Alert>
      )}

      {isLoading ? (
        <CardLoadingSkeleton count={3} />
      ) : (
        <Grid container spacing={3}>
          {statCards.map((card, idx) => (
            <Grid size={{ xs: 12, sm: 4 }} key={idx}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease, boxShadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="h3" sx={{ my: 0.5, color: card.color, fontWeight: 800 }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        background: card.bgGradient,
                        width: 56,
                        height: 56,
                        boxShadow: `0 8px 16px ${card.color}40`,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
