import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth";
import { userApi } from "../api/user.api";
import { ResetPasswordDialog } from "../components/forms/ResetPasswordDialog";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

export const UserLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/user/login");
  };

  const handleResetPasswordSubmit = async (oldPassword: string, newPassword: string) => {
    setResetLoading(true);
    try {
      await userApi.resetPassword(oldPassword, newPassword);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
      throw err;
    } finally {
      setResetLoading(false);
    }
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardOutlinedIcon />,
      path: "/user/dashboard",
    },
    {
      text: "My Documents",
      icon: <DescriptionOutlinedIcon />,
      path: "/user/documents",
    },
    {
      text: "Upload Document",
      icon: <CloudUploadOutlinedIcon />,
      path: "/user/documents/upload",
    },
    {
      text: "Signer Roles",
      icon: <BadgeOutlinedIcon />,
      path: "/user/signer-roles",
    },
  ];

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const getBreadcrumbTitle = () => {
    if (location.pathname.includes("upload")) return "Upload PDF";
    if (location.pathname.includes("editor")) return "PDF Document Editor";
    if (location.pathname.includes("documents")) return "My Documents";
    if (location.pathname.includes("signer-roles")) return "Signer Roles";
    return "Dashboard";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7F8FA" }}>
      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#FFFFFF",
            borderColor: "#E5E7EB",
            overflowX: "hidden",
            transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        {/* Brand Container */}
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            px: collapsed ? 2.5 : 2.5,
            gap: 1.5,
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              bgcolor: "#1976D2",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <DrawOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          {!collapsed && (
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1F2937", lineHeight: 1.2 }}>
                E-Sign DMS
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", letterSpacing: "0.5px" }}>

              </Typography>
            </Box>
          )}
        </Box>

        {/* Menu Items */}
        <List sx={{ p: 1.5 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ display: "block", mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 44,
                    borderRadius: "8px",
                    px: 2,
                    justifyContent: collapsed ? "center" : "initial",
                    bgcolor: isSelected ? "#EFF6FF" : "transparent",
                    color: isSelected ? "#1976D2" : "#4B5563",
                    position: "relative",
                    "&:hover": {
                      bgcolor: isSelected ? "#EFF6FF" : "#F3F4F6",
                    },
                    "&::before": isSelected
                      ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        height: "60%",
                        width: "3px",
                        borderRadius: "0 4px 4px 0",
                        bgcolor: "#1976D2",
                      }
                      : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? "auto" : 2,
                      justifyContent: "center",
                      color: isSelected ? "#1976D2" : "#6B7280",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          sx: { fontSize: "0.875rem", fontWeight: isSelected ? 600 : 500 },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Layout Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            color: "#1F2937",
            borderBottom: "1px solid #E5E7EB",
            height: 64,
            justifyContent: "center",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => setCollapsed(!collapsed)} edge="start" size="small">
                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
              </IconButton>

              <Breadcrumbs separator="/" sx={{ fontSize: "0.875rem" }}>
                <Link color="inherit" underline="none" href="#" onClick={(e) => e.preventDefault()}>
                  Workspace
                </Link>
                <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {getBreadcrumbTitle()}
                </Typography>
              </Breadcrumbs>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Search Field */}
              {/* <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  bgcolor: "#F3F4F6",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.5,
                  width: 220,
                }}
              >
                <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20, mr: 1 }} />
                <InputBase
                  placeholder="Search documents & roles..."
                  sx={{ fontSize: "0.875rem", width: "100%" }}
                />
              </Box> */}

              {/* Notification Icon */}
              {/* <Tooltip title="Notifications">
                <IconButton size="small">
                  <Badge badgeContent={3} color="primary">
                    <NotificationsNoneOutlinedIcon />
                  </Badge>
                </IconButton>
              </Tooltip> */}

              {/* User Avatar Menu Trigger */}
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
                sx={{ ml: 0.5 }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#1976D2", fontSize: "0.875rem", fontWeight: 700 }}>
                  {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              {/* Profile Menu Dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    elevation: 2,
                    sx: { width: 220, borderRadius: "10px", mt: 1, p: 0.5 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user?.fullName || "User Account"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    setResetDialogOpen(true);
                  }}
                  sx={{ borderRadius: "6px", py: 1 }}
                >
                  <ListItemIcon>
                    <VpnKeyOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Reset Password
                  </Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ borderRadius: "6px", py: 1, color: "error.main" }}>
                  <ListItemIcon>
                    <LogoutOutlinedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Sign Out
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content View */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2.5, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>

      {/* Password Reset Modal */}
      <ResetPasswordDialog
        open={resetDialogOpen}
        title="Reset Password"
        loading={resetLoading}
        onClose={() => setResetDialogOpen(false)}
        onSubmit={handleResetPasswordSubmit}
      />
    </Box>
  );
};
