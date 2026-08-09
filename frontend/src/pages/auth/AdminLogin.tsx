import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from "@mui/material";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../../hooks/useAuth";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const AdminLogin: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const success = await adminLogin(data.email, data.password);
      if (success) {
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in as administrator.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh", bgcolor: "#F7F8FA" }}>
      {/* Left Column - Enterprise Branding Panel */}
      <Grid
        size={{ xs: 0, md: 7, lg: 8 }}
        sx={{
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          p: { md: 6, lg: 8 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              bgcolor: "#1976D2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
            }}
          >
            <VerifiedUserOutlinedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFF", lineHeight: 1.2 }}>
              eSign Pro
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase" }}>
              Enterprise Platform
            </Typography>
          </Box>
        </Box>

        {/* Hero Section */}
        <Box sx={{ maxWidth: 560, my: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.25 }}>
            Enterprise System Governance & Security
          </Typography>
          <Typography variant="body1" sx={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.6, mb: 5 }}>
            Centralized platform administration, audit logs, compliance controls, and global electronic signature configurations for organization accounts.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {[
              "Role-based permission controls & account management",
              "Compliance grade audit logs & digital signature tracking",
              "256-bit AES end-to-end document encryption",
            ].map((feature, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: "#1976D2", fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 500, color: "#E2E8F0" }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Typography variant="caption" sx={{ color: "#64748B" }}>
          © 2026 eSign Document Management System. All rights reserved.
        </Typography>
      </Grid>

      {/* Right Column - Login Form Panel */}
      <Grid
        size={{ xs: 12, md: 5, lg: 4 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}>
                  Admin Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your administrative credentials to access governance
                </Typography>
              </Box>

              {errorMsg && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        placeholder="admin@esign.com"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <MailOutlinedIcon sx={{ color: "#9CA3AF" }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        placeholder="••••••••"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlinedIcon sx={{ color: "#9CA3AF" }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      py: 1.5,
                      mt: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                    }}
                  >
                    Sign In to Admin Portal
                  </Button>

                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Standard user account?{" "}
                      <Link
                        component={RouterLink}
                        to="/user/login"
                        sx={{ color: "#1976D2", fontWeight: 600, textDecoration: "none" }}
                      >
                        Switch to User Login
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};
