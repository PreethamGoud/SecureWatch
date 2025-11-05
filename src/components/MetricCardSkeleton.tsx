/**
 * Metric Card Skeleton - Loading placeholder for dashboard metric cards
 */

import { Box, Skeleton, Paper, alpha, useTheme } from "@mui/material";

export default function MetricCardSkeleton() {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
        <Skeleton variant="circular" width={56} height={56} />
      </Box>
    </Paper>
  );
}
