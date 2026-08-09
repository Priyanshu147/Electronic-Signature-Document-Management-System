import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        textAlign: "center",
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderRadius: 3,
        border: "1px dashed rgba(0, 0, 0, 0.12)",
        my: 2,
      }}
    >
      <Box sx={{ color: "text.secondary", fontSize: 56, mb: 1 }}>
        {icon || <InboxIcon fontSize="inherit" />}
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: actionText ? 2 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ borderRadius: 2 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
