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
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {children}
        {actionText && onAction && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon}
            onClick={onAction}
            sx={{ borderRadius: 2, px: 2.5, py: 1 }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Box>
  );
};
