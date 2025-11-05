/**
 * Creative Analysis Filter Buttons Component
 * Features engaging visual design with filter state indicators,
 * animated transitions, and impact visualization
 */

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Collapse,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Psychology as AiIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { calculateFilterImpact } from "../utils/filtering";

export default function AnalysisButtons() {
  const theme = useTheme();
  const { filters, updateFilter, allVulnerabilities, filteredVulnerabilities } =
    useVulnerabilities();
  const [showImpact, setShowImpact] = useState(false);

  const isAnalysisActive = filters.excludeInvalidNoRisk || false;
  const isAiAnalysisActive = filters.excludeAiInvalidNoRisk || false;

  // Calculate impact when filters change
  useEffect(() => {
    if (isAnalysisActive || isAiAnalysisActive) {
      setShowImpact(true);
      const timer = setTimeout(() => setShowImpact(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAnalysisActive, isAiAnalysisActive]);

  const impact = calculateFilterImpact(
    allVulnerabilities.length,
    filteredVulnerabilities.length
  );

  const handleAnalysisClick = () => {
    updateFilter("excludeInvalidNoRisk", !isAnalysisActive);
  };

  const handleAiAnalysisClick = () => {
    updateFilter("excludeAiInvalidNoRisk", !isAiAnalysisActive);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        🔍 Analysis Filters
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {/* Manual Analysis Button */}
        <Button
          variant={isAnalysisActive ? "contained" : "outlined"}
          size="large"
          startIcon={isAnalysisActive ? <CheckIcon /> : <FilterIcon />}
          onClick={handleAnalysisClick}
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 auto" },
            minWidth: 200,
            height: 60,
            position: "relative",
            overflow: "hidden",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "all 0.3s ease",
            background: isAnalysisActive
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : "transparent",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: isAnalysisActive ? 6 : 3,
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, transparent 0%, ${alpha(
                theme.palette.primary.light,
                0.3
              )} 100%)`,
              opacity: isAnalysisActive ? 1 : 0,
              transition: "opacity 0.3s ease",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            Analysis
            <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
              {isAnalysisActive ? "Active" : "Filter invalid-norisk"}
            </Typography>
          </Box>
        </Button>

        {/* AI Analysis Button */}
        <Button
          variant={isAiAnalysisActive ? "contained" : "outlined"}
          size="large"
          startIcon={isAiAnalysisActive ? <CheckIcon /> : <AiIcon />}
          onClick={handleAiAnalysisClick}
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 auto" },
            minWidth: 200,
            height: 60,
            position: "relative",
            overflow: "hidden",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "all 0.3s ease",
            background: isAiAnalysisActive
              ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
              : "transparent",
            borderColor: isAiAnalysisActive
              ? theme.palette.secondary.main
              : theme.palette.secondary.light,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: isAiAnalysisActive ? 6 : 3,
              borderColor: theme.palette.secondary.main,
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, transparent 0%, ${alpha(
                theme.palette.secondary.light,
                0.3
              )} 100%)`,
              opacity: isAiAnalysisActive ? 1 : 0,
              transition: "opacity 0.3s ease",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            AI Analysis
            <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
              {isAiAnalysisActive ? "Active" : "Filter ai-invalid-norisk"}
            </Typography>
          </Box>
        </Button>

        {/* Clear All Button */}
        {(isAnalysisActive || isAiAnalysisActive) && (
          <Button
            variant="outlined"
            color="error"
            size="large"
            startIcon={<CancelIcon />}
            onClick={() => {
              updateFilter("excludeInvalidNoRisk", false);
              updateFilter("excludeAiInvalidNoRisk", false);
            }}
            sx={{
              height: 60,
              fontWeight: "bold",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Active Filters Chips */}
      {(isAnalysisActive || isAiAnalysisActive) && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {isAnalysisActive && (
            <Chip
              label="Manual Analysis Active"
              color="primary"
              size="small"
              onDelete={() => updateFilter("excludeInvalidNoRisk", false)}
              icon={<FilterIcon />}
            />
          )}
          {isAiAnalysisActive && (
            <Chip
              label="AI Analysis Active"
              color="secondary"
              size="small"
              onDelete={() => updateFilter("excludeAiInvalidNoRisk", false)}
              icon={<AiIcon />}
            />
          )}
        </Box>
      )}

      {/* Impact Visualization */}
      <Collapse in={showImpact && (isAnalysisActive || isAiAnalysisActive)}>
        <Alert
          severity="info"
          icon={<TrendingDownIcon />}
          sx={{
            mt: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Filter Impact
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Removed
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  {impact.removed.toLocaleString()} (
                  {impact.percentageRemoved.toFixed(1)}%)
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {impact.remaining.toLocaleString()} (
                  {impact.percentageRemaining.toFixed(1)}%)
                </Typography>
              </Box>
            </Box>

            {/* Visual Progress Bar */}
            <Box
              sx={{
                mt: 2,
                position: "relative",
                height: 20,
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "grey.200",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${impact.percentageRemaining}%`,
                  bgcolor: theme.palette.success.main,
                  transition: "width 0.5s ease",
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  fontWeight: "bold",
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {impact.percentageRemaining.toFixed(1)}% Active
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Collapse>

      {/* Info Text */}
      {!isAnalysisActive && !isAiAnalysisActive && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          💡 Use these filters to exclude vulnerabilities marked as
          "invalid-norisk" (manual) or "ai-invalid-norisk" (AI-detected) from
          your analysis.
        </Typography>
      )}
    </Paper>
  );
}
