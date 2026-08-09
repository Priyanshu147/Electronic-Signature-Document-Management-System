import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  description = "There are no records to display right now.",
  actionText,
  onAction,
  icon,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 2.5,
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        my: 2,
      }}
    >
      <Box sx={{ color: "#9CA3AF", mb: 1.5 }}>
        {icon || <InboxOutlinedIcon sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mb: actionText ? 2.5 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ borderRadius: 2 }}>
          {actionText}
        </Button>
      )}
    </Paper>
  );
};
