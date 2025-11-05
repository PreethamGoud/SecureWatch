/**
 * Chart Skeleton - Loading placeholder for chart visualizations
 */

import { Box, Skeleton, Paper, alpha, useTheme } from "@mui/material";

interface ChartSkeletonProps {
  height?: number;
  variant?: "pie" | "bar" | "line";
}

export default function ChartSkeleton({
  height = 350,
  variant = "bar",
}: ChartSkeletonProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        height,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />

      {variant === "pie" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 50px)",
          }}
        >
          <Skeleton variant="circular" width={200} height={200} />
        </Box>
      )}

      {variant === "bar" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: "calc(100% - 50px)",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="12%"
              height={`${30 + Math.random() * 60}%`}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      )}

      {variant === "line" && (
        <Box sx={{ pt: 2, height: "calc(100% - 50px)" }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 1 }}
          />
        </Box>
      )}
    </Paper>
  );
}
