import React from "react";
import { useDrag } from "react-dnd";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Avatar,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
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
    <Card
      ref={drag as any}
      elevation={0}
      sx={{
        mb: 1.5,
        cursor: "grab",
        opacity: isDragging ? 0.4 : 1,
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#1976D2",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
      }}
    >
      <CardContent sx={{ p: "12px 16px !important", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "#EFF6FF", color: "#1976D2", width: 34, height: 34, borderRadius: 2 }}>
            <BadgeOutlinedIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937", lineHeight: 1.2 }}>
              {role.role_name}
            </Typography>
            {role.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {role.description}
              </Typography>
            )}
          </Box>
        </Box>
        <DragIndicatorIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
      </CardContent>
    </Card>
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
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        bgcolor: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "#1F2937" }}>
        Signer Roles
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Drag any role below onto a PDF page canvas to place a signature box.
      </Typography>

    {/*   <Alert
        icon={<InfoOutlinedIcon fontSize="small" />}
        severity="info"
        sx={{ mb: 2.5, borderRadius: 2, "& .MuiAlert-message": { fontSize: "0.8125rem" } }}
      >
        Select a role, drag it over the PDF page, and release to assign signature placement.
      </Alert> */}

      {loading ? (
        <Box>
          {Array.from(new Array(3)).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={54} sx={{ mb: 1.5, borderRadius: 2 }} />
          ))}
        </Box>
      ) : roles.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Chip label="No Roles Available" color="warning" size="small" sx={{ fontWeight: 600, mb: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Create custom signer roles in the Signer Roles workspace.
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
