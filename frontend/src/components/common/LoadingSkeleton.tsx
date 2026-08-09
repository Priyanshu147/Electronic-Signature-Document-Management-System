import React from "react";
import { Box, Skeleton, Card, CardContent, Grid } from "@mui/material";

export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Skeleton variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
      {Array.from(new Array(rows)).map((_, idx) => (
        <Skeleton key={idx} variant="rectangular" height={45} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
};

export const CardLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from(new Array(count)).map((_, idx) => (
        <Grid size={{ xs: 12, sm: 4 }} key={idx}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={25} />
              <Skeleton variant="rectangular" height={50} sx={{ my: 1, borderRadius: 1 }} />
              <Skeleton variant="text" width="40%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
