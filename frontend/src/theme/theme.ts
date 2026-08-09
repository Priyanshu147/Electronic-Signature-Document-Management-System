import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976D2",
      light: "#42A5F5",
      dark: "#1565C0",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#6B7280",
      light: "#9CA3AF",
      dark: "#374151",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F7F8FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
    },
    success: {
      main: "#16A34A",
      light: "#DCFCE7",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#DC2626",
      light: "#FEE2E2",
      contrastText: "#FFFFFF",
    },
    divider: "#E5E7EB",
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 800, fontSize: "2.25rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25 },
    h3: { fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.3 },
    h4: { fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, fontSize: "0.9375rem" },
    subtitle2: { fontWeight: 500, fontSize: "0.875rem" },
    body1: { fontSize: "0.875rem", lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.875rem" },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          padding: "8px 16px",
          fontWeight: 600,
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#1976D2",
          "&:hover": {
            backgroundColor: "#1565C0",
          },
        },
        outlined: {
          borderColor: "#E5E7EB",
          color: "#1976D2",
          "&:hover": {
            backgroundColor: "#EFF6FF",
            borderColor: "#1976D2",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 10,
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
          border: "1px solid #E5E7EB",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          "& fieldset": {
            borderColor: "#E5E7EB",
          },
          "&:hover fieldset": {
            borderColor: "#9CA3AF",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1976D2",
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#F8FAFC",
          color: "#475569",
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: "1px solid #E5E7EB",
          padding: "12px 16px",
        },
        body: {
          fontSize: "0.875rem",
          borderBottom: "1px solid #F1F5F9",
          padding: "14px 16px",
          color: "#1F2937",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },
  },
});
