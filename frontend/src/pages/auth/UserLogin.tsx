import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  InputAdornment,
  IconButton,
  Alert,
  Container,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "../../hooks/useAuth";

const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type UserLoginFormValues = z.infer<typeof userLoginSchema>;

export const UserLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { userLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginFormValues>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserLoginFormValues) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const success = await userLogin(data.email, data.password);
      if (success) {
        navigate("/user/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in as user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 4,
              pb: 2,
              textAlign: "center",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "white",
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
            >
              <PersonIcon sx={{ fontSize: 36, color: "white" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              User Workspace
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Sign in to manage documents & signature workflows
            </Typography>
          </Box>

          <CardContent sx={{ p: 4, pt: 3 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                fullWidth
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  backgroundColor: "#4f46e5",
                  "&:hover": { backgroundColor: "#4338ca" },
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
                }}
              >
                {submitting ? <CircularProgress size={26} color="inherit" /> : "Sign In to Workspace"}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Administrator?{" "}
                  <Link
                    component={RouterLink}
                    to="/admin/login"
                    color="primary"
                    sx={{ textDecoration: "none", fontWeight: 600 }}
                  >
                    Admin Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
