import React, { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { Page } from "react-pdf";
import { Box, Chip } from "@mui/material";
import { ITEM_TYPE_SIGNER_ROLE } from "../signer/SignerRoleSidebar";
import { SignatureFieldBox } from "../signer/SignatureFieldBox";
import type { PlacedSignatureField } from "../signer/SignatureFieldBox";

interface PdfPageCanvasProps {
  pageNumber: number;
  scale: number;
  fields: PlacedSignatureField[];
  selectedFieldId?: string | null;
  onSelectField?: (field: PlacedSignatureField | null) => void;
  onAddField: (field: Omit<PlacedSignatureField, "tempId">) => void;
  onUpdateField: (updated: PlacedSignatureField) => void;
  onDeleteField: (tempId: string) => void;
}

export const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pageNumber,
  scale,
  fields,
  selectedFieldId,
  onSelectField,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE_SIGNER_ROLE,
      drop: (item: { signerRoleId: number; roleName: string }, monitor) => {
        const clientOffset = monitor.getClientOffset();
        if (clientOffset && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const dropX = clientOffset.x - rect.left;
          const dropY = clientOffset.y - rect.top;

          // Default signature box width & height percentages
          const defaultWPercent = 25;
          const defaultHPercent = 8;

          let xPercent = (dropX / rect.width) * 100;
          let yPercent = (dropY / rect.height) * 100;

          // Ensure box stays inside page boundaries
          xPercent = Math.max(0, Math.min(xPercent, 100 - defaultWPercent));
          yPercent = Math.max(0, Math.min(yPercent, 100 - defaultHPercent));

          onAddField({
            signerRoleId: item.signerRoleId,
            roleName: item.roleName,
            pageNumber,
            xPosition: Math.round(xPercent * 100) / 100,
            yPosition: Math.round(yPercent * 100) / 100,
            width: defaultWPercent,
            height: defaultHPercent,
            required: true,
          });
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [pageNumber, onAddField]
  );

  const handlePageLoadSuccess = (pageData: { width: number; height: number }) => {
    setPageSize({ width: pageData.width * scale, height: pageData.height * scale });
  };

  const pageFields = fields.filter((f) => f.pageNumber === pageNumber);

  return (
    <Box
      id={`pdf-page-${pageNumber}`}
      ref={(node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (node) drop(node);
      }}
      onClick={() => {
        if (onSelectField) onSelectField(null);
      }}
      sx={{
        position: "relative",
        mb: 4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#FFFFFF",
        outline: isOver ? "3px dashed #1976D2" : "none",
        outlineOffset: "2px",
        transition: "outline 0.15s ease",
      }}
    >
      {/* React PDF Page Rendering */}
      <Page
        pageNumber={pageNumber}
        scale={scale}
        onLoadSuccess={handlePageLoadSuccess}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />

      {/* Page Number Badge */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <Chip
          label={`Page ${pageNumber}`}
          size="small"
          sx={{ bgcolor: "rgba(15, 23, 42, 0.75)", color: "#FFFFFF", fontWeight: 600 }}
        />
      </Box>

      {/* Placed Signature Field Overlays */}
      {pageFields.map((field) => (
        <SignatureFieldBox
          key={field.tempId}
          field={field}
          scale={scale}
          pageWidth={pageSize.width}
          pageHeight={pageSize.height}
          isSelected={selectedFieldId === field.tempId}
          onSelect={(f) => onSelectField && onSelectField(f)}
          onUpdate={onUpdateField}
          onDelete={onDeleteField}
        />
      ))}
    </Box>
  );
};
