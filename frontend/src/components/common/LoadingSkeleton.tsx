import React from "react";
import { Card, CardContent, Skeleton, Box } from "@mui/material";

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 4 }) => {
  return (
    <Card elevation={0} sx={{ my: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={32} width="30%" sx={{ mb: 2, borderRadius: 1 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from(new Array(rows)).map((_, idx) => (
            <Skeleton key={idx} variant="rounded" height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
