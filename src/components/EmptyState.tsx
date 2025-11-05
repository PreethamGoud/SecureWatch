/**
 * Empty State Component - Beautiful empty states for various scenarios
 */

import { Box, Typography, Button, alpha, useTheme } from "@mui/material";
import {
  SearchOff as NoResultsIcon,
  CloudUpload as UploadIcon,
  CompareArrows as CompareIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface EmptyStateProps {
  variant: "no-results" | "no-data" | "no-comparison" | "no-filters";
  onAction?: () => void;
  actionLabel?: string;
  title?: string;
  description?: string;
}

const variants = {
  "no-results": {
    icon: NoResultsIcon,
    defaultTitle: "No Results Found",
    defaultDescription:
      "Try adjusting your filters or search terms to find what you're looking for.",
    defaultActionLabel: "Clear Filters",
    color: "info",
  },
  "no-data": {
    icon: UploadIcon,
    defaultTitle: "No Data Available",
    defaultDescription:
      "Upload your vulnerability data to get started with the analysis.",
    defaultActionLabel: "Upload Data",
    color: "primary",
  },
  "no-comparison": {
    icon: CompareIcon,
    defaultTitle: "No Items Selected",
    defaultDescription:
      "Select vulnerabilities from the table to compare them side-by-side.",
    defaultActionLabel: undefined,
    color: "secondary",
  },
  "no-filters": {
    icon: FilterIcon,
    defaultTitle: "All Data Displayed",
    defaultDescription: "Apply filters to narrow down the results.",
    defaultActionLabel: "Open Filters",
    color: "success",
  },
};

export default function EmptyState({
  variant,
  onAction,
  actionLabel,
  title,
  description,
}: EmptyStateProps) {
  const theme = useTheme();
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          px: 4,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              config.color === "info"
                ? alpha(theme.palette.info.main, 0.1)
                : config.color === "primary"
                ? alpha(theme.palette.primary.main, 0.1)
                : config.color === "secondary"
                ? alpha(theme.palette.secondary.main, 0.1)
                : alpha(theme.palette.success.main, 0.1),
            mb: 3,
          }}
        >
          <Icon
            sx={{
              fontSize: 60,
              color:
                config.color === "info"
                  ? "info.main"
                  : config.color === "primary"
                  ? "primary.main"
                  : config.color === "secondary"
                  ? "secondary.main"
                  : "success.main",
            }}
          />
        </Box>

        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          color="text.primary"
        >
          {title || config.defaultTitle}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          {description || config.defaultDescription}
        </Typography>

        {onAction && (
          <Button
            variant="contained"
            size="large"
            onClick={onAction}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            {actionLabel || config.defaultActionLabel}
          </Button>
        )}
      </Box>
    </motion.div>
  );
}
