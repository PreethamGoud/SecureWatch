/**
 * Table Skeleton Loader - Animated loading placeholder for tables
 */

import { Box, Skeleton, Paper, alpha, useTheme } from "@mui/material";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 10,
  columns = 6,
}: TableSkeletonProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={i === 0 ? "20%" : "15%"}
            height={24}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width={colIndex === 0 ? "20%" : colIndex === 1 ? "10%" : "15%"}
              height={20}
              sx={{ flexShrink: 0 }}
            />
          ))}
        </Box>
      ))}
    </Paper>
  );
}
