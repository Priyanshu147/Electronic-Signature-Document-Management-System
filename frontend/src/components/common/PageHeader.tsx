import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionText,
  actionIcon,
  onAction,
  children,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        {children}
        {actionText && onAction && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon}
            onClick={onAction}
            sx={{ borderRadius: 2, px: 2.5, py: 1, fontWeight: 600 }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Box>
  );
};
