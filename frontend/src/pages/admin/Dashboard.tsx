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
  IconButton,
  Tooltip,
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { adminApi } from "../../api/admin.api";
import { formatDate } from "../../utils/formatters";
import type { UserItem } from "../../types/user.types";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["adminRecentUsers"],
    queryFn: () => adminApi.getUsers({ page: 1, limit: 5 }),
  });

  const stats = statsData?.data || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 };
  const recentUsers = usersData?.users || [];

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Admin Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System performance metrics, user statistics, and platform governance
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={() => navigate("/admin/users")}
            sx={{ borderRadius: 2 }}
          >
            Manage Users
          </Button>
        </Box>
      </Box>

      {/* Summary Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Total Platform Users
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1, display: "block" }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#1F2937", my: 0.5 }}>
                      {stats.totalUsers}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: "#EFF6FF", color: "#1976D2", width: 48, height: 48, borderRadius: 2.5 }}>
                  <PeopleOutlinedIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                Registered system accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Active Users
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1, display: "block" }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#16A34A", my: 0.5 }}>
                      {stats.activeUsers}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: "#DCFCE7", color: "#16A34A", width: 48, height: 48, borderRadius: 2.5 }}>
                  <CheckCircleOutlinedIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                Active user profiles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Inactive Users
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={24} sx={{ mt: 1, display: "block" }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#6B7280", my: 0.5 }}>
                      {stats.inactiveUsers}
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: "#F3F4F6", color: "#6B7280", width: 48, height: 48, borderRadius: 2.5 }}>
                  <BlockOutlinedIcon />
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                Suspended accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Users Section */}
      <Card elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recent User Accounts
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon fontSize="small" />}
              onClick={() => navigate("/admin/users")}
            >
              View All Users
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Name & Email</TableCell>
                  <TableCell>Account Status</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : recentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No user accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentUsers.map((u: UserItem) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#1976D2", width: 34, height: 34, fontSize: "0.875rem" }}>
                            {u.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {u.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {u.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.status}
                          size="small"
                          color={u.status === "Active" ? "success" : "default"}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(u.created_at)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => navigate("/admin/users")}>
                          Manage →
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
