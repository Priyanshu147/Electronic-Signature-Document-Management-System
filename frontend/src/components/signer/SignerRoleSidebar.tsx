import React from "react";
import { useDrag } from "react-dnd";
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  Skeleton,
  Divider,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import BadgeIcon from "@mui/icons-material/Badge";
import type { SignerRoleItem } from "../../types/signerRole.types";

export const ITEM_TYPE_SIGNER_ROLE = "SIGNER_ROLE";

interface DraggableSignerRoleItemProps {
  role: SignerRoleItem;
}

const DraggableSignerRoleItem: React.FC<DraggableSignerRoleItemProps> = ({ role }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ITEM_TYPE_SIGNER_ROLE,
      item: { signerRoleId: role.id, roleName: role.role_name },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [role]
  );

  return (
    <Paper
      ref={drag as any}
      elevation={isDragging ? 6 : 1}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        backgroundColor: "background.paper",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: "primary.light",
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <BadgeIcon color="primary" />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {role.role_name}
          </Typography>
          {role.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {role.description}
            </Typography>
          )}
        </Box>
      </Box>
      <DragIndicatorIcon color="action" />
    </Paper>
  );
};

interface SignerRoleSidebarProps {
  roles: SignerRoleItem[];
  loading?: boolean;
}

export const SignerRoleSidebar: React.FC<SignerRoleSidebarProps> = ({
  roles,
  loading = false,
}) => {
  return (
    <Box sx={{ width: 280, p: 2, borderRight: "1px solid rgba(0,0,0,0.08)", bgcolor: "#fafafa" }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        Signer Roles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag a role below and drop it onto any PDF page to add a signature box.
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <List>
          {Array.from(new Array(3)).map((_, i) => (
            <ListItem key={i} disablePadding sx={{ mb: 1.5 }}>
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
            </ListItem>
          ))}
        </List>
      ) : roles.length === 0 ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Chip label="No Signer Roles Found" color="warning" variant="outlined" size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Please create signer roles first in the Signer Roles tab.
          </Typography>
        </Box>
      ) : (
        <Box>
          {roles.map((role) => (
            <DraggableSignerRoleItem key={role.id} role={role} />
          ))}
        </Box>
      )}
    </Box>
  );
};
