import React, { useState, useRef } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

export interface PlacedSignatureField {
  tempId: string;
  signerRoleId: number;
  roleName: string;
  pageNumber: number;
  xPosition: number; // percentage (0 to 100)
  yPosition: number; // percentage (0 to 100)
  width: number;
  height: number;
  required: boolean;
}

interface SignatureFieldBoxProps {
  field: PlacedSignatureField;
  scale?: number;
  pageWidth: number;
  pageHeight: number;
  isSelected?: boolean;
  onSelect?: (field: PlacedSignatureField) => void;
  onUpdate: (updated: PlacedSignatureField) => void;
  onDelete: (tempId: string) => void;
}

export const SignatureFieldBox: React.FC<SignatureFieldBoxProps> = ({
  field,
  pageWidth,
  pageHeight,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  const boxX = (field.xPosition / 100) * pageWidth;
  const boxY = (field.yPosition / 100) * pageHeight;
  const boxW = Math.max((field.width / 100) * pageWidth, 120);
  const boxH = Math.max((field.height / 100) * pageHeight, 48);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(field);

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: boxX,
      initY: boxY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      let newX = dragStartRef.current.initX + deltaX;
      let newY = dragStartRef.current.initY + deltaY;

      // Keep inside page boundaries
      newX = Math.max(0, Math.min(newX, pageWidth - boxW));
      newY = Math.max(0, Math.min(newY, pageHeight - boxH));

      const newXPercent = (newX / pageWidth) * 100;
      const newYPercent = (newY / pageHeight) * 100;

      onUpdate({
        ...field,
        xPosition: Math.round(newXPercent * 100) / 100,
        yPosition: Math.round(newYPercent * 100) / 100,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${field.xPosition}%`,
        top: `${field.yPosition}%`,
        width: `${field.width}%`,
        minWidth: 120,
        height: `${field.height}%`,
        minHeight: 48,
        border: isSelected ? "2px solid #1976D2" : "2px dashed #1976D2",
        borderRadius: "10px",
        bgcolor: isSelected ? "rgba(25, 118, 210, 0.18)" : "rgba(25, 118, 210, 0.10)",
        boxShadow: isDragging
          ? "0 8px 20px rgba(25, 118, 210, 0.35)"
          : isSelected
          ? "0 0 0 3px rgba(25, 118, 210, 0.2), 0 2px 6px rgba(0,0,0,0.1)"
          : "0 2px 6px rgba(0,0,0,0.08)",
        cursor: isDragging ? "grabbing" : "grab",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 0.75,
        zIndex: isSelected ? 20 : 10,
        userSelect: "none",
        transition: isDragging ? "none" : "all 0.15s ease",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(field);
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, overflow: "hidden" }}>
          <DragIndicatorIcon sx={{ color: "#1976D2", fontSize: 16 }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#0F172A",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 90,
            }}
          >
            {field.roleName}
          </Typography>
        </Box>

        <Tooltip title="Delete Field">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.tempId);
            }}
            sx={{ p: 0.2, color: "error.main", "&:hover": { bgcolor: "error.light" } }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          borderTop: "1px dashed rgba(25, 118, 210, 0.25)",
          mt: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "#1E3A8A", fontWeight: 600, fontSize: "0.7rem" }}>
          [ Signature ]
        </Typography>
      </Box>
    </Box>
  );
};
