import React, { useState, useRef } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import DrawIcon from "@mui/icons-material/Draw";

export interface PlacedSignatureField {
  tempId: string;
  signerRoleId: number;
  roleName: string;
  pageNumber: number;
  xPosition: number; // percentage (0 to 100) or pixel
  yPosition: number; // percentage (0 to 100) or pixel
  width: number;
  height: number;
  required: boolean;
}

interface SignatureFieldBoxProps {
  field: PlacedSignatureField;
  scale?: number;
  pageWidth: number;
  pageHeight: number;
  onUpdate: (updated: PlacedSignatureField) => void;
  onDelete: (tempId: string) => void;
}

export const SignatureFieldBox: React.FC<SignatureFieldBoxProps> = ({
  field,
  pageWidth,
  pageHeight,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Convert percentages or relative positions to page pixels
  const boxX = (field.xPosition / 100) * pageWidth;
  const boxY = (field.yPosition / 100) * pageHeight;
  const boxW = Math.max((field.width / 100) * pageWidth, 120);
  const boxH = Math.max((field.height / 100) * pageHeight, 50);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        minHeight: 50,
        border: "2px dashed #4f46e5",
        borderRadius: 1.5,
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        backdropFilter: "blur(2px)",
        boxShadow: isDragging
          ? "0 8px 20px rgba(79, 70, 229, 0.4)"
          : "0 2px 8px rgba(0,0,0,0.15)",
        cursor: isDragging ? "grabbing" : "grab",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 0.5,
        zIndex: 10,
        userSelect: "none",
        transition: isDragging ? "none" : "box-shadow 0.15s ease",
      }}
      onMouseDown={handleMouseDown}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <DrawIcon sx={{ fontSize: 16, color: "#4f46e5" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#3730a3",
              fontSize: "0.75rem",
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 100,
            }}
          >
            {field.roleName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Drag to Move">
            <OpenWithIcon sx={{ fontSize: 14, color: "#4f46e5", mr: 0.5 }} />
          </Tooltip>
          <Tooltip title="Delete Field">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(field.tempId);
              }}
              sx={{ p: 0.2, color: "error.main", "&:hover": { bgcolor: "error.light" } }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          borderTop: "1px dashed rgba(79, 70, 229, 0.3)",
          mt: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "#4338ca", fontStyle: "italic", fontSize: "0.7rem" }}>
          Sign Here
        </Typography>
      </Box>
    </Box>
  );
};
