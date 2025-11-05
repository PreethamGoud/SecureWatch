/**
 * Advanced Filters - Severity, CVSS, Package, Date Range
 */

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";

export default function AdvancedFilters() {
  const theme = useTheme();
  const { filters, setFilters } = useVulnerabilities();
  const [searchTerm, setSearchTerm] = useState("");

  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

  const handleSeverityToggle = (severity: string) => {
    const currentSeverities = filters.severities || severities;
    const newSeverities = currentSeverities.includes(severity)
      ? currentSeverities.filter((s) => s !== severity)
      : [...currentSeverities, severity];
    setFilters({ ...filters, severities: newSeverities });
  };

  const handleCvssChange = (_event: Event, value: number | number[]) => {
    const [min, max] = value as number[];
    setFilters({ ...filters, cvssRange: [min, max] });
  };

  const handlePackageSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, packageNames: value ? [value] : [] });
  };

  const clearAllFilters = () => {
    setFilters({
      severities: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"],
      cvssRange: [0, 10],
      packageNames: [],
      excludeInvalidNoRisk: false,
      excludeAiInvalidNoRisk: false,
    });
    setSearchTerm("");
  };

  const currentSeverities = filters.severities || severities;
  const currentCvssRange = filters.cvssRange || [0, 10];
  const currentPackageNames = filters.packageNames || [];

  const hasActiveFilters =
    currentSeverities.length < 5 ||
    currentCvssRange[0] > 0 ||
    currentCvssRange[1] < 10 ||
    currentPackageNames.length > 0 ||
    filters.excludeInvalidNoRisk ||
    filters.excludeAiInvalidNoRisk;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label="Clear All"
              onDelete={clearAllFilters}
              deleteIcon={<CloseIcon />}
              color="primary"
              size="small"
              sx={{
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  fontSize: 16,
                },
              }}
            />
          </Box>
        )}

        {/* Severity Filter */}
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Severity
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <FormGroup>
              {severities.map((severity) => (
                <FormControlLabel
                  key={severity}
                  control={
                    <Checkbox
                      checked={currentSeverities.includes(severity)}
                      onChange={() => handleSeverityToggle(severity)}
                      sx={{
                        "&.Mui-checked": {
                          color:
                            severity === "CRITICAL"
                              ? "error.main"
                              : severity === "HIGH"
                              ? "warning.main"
                              : severity === "MEDIUM"
                              ? "info.main"
                              : "success.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">{severity}</Typography>
                      <Chip
                        label={severity}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: "bold",
                          bgcolor:
                            severity === "CRITICAL"
                              ? alpha(theme.palette.error.main, 0.1)
                              : severity === "HIGH"
                              ? alpha(theme.palette.warning.main, 0.1)
                              : severity === "MEDIUM"
                              ? alpha(theme.palette.info.main, 0.1)
                              : alpha(theme.palette.success.main, 0.1),
                          color:
                            severity === "CRITICAL"
                              ? "error.main"
                              : severity === "HIGH"
                              ? "warning.main"
                              : severity === "MEDIUM"
                              ? "info.main"
                              : "success.main",
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* CVSS Score Range */}
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              CVSS Score
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <Box sx={{ px: 1 }}>
              <Slider
                value={currentCvssRange}
                onChange={handleCvssChange}
                valueLabelDisplay="auto"
                min={0}
                max={10}
                step={0.1}
                marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                ]}
                sx={{
                  "& .MuiSlider-thumb": {
                    width: 16,
                    height: 16,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Range: {currentCvssRange[0].toFixed(1)} -{" "}
                {currentCvssRange[1].toFixed(1)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Package Name Search */}
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Package Name
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search package..."
              value={searchTerm}
              onChange={(e) => handlePackageSearch(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            {currentPackageNames.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {currentPackageNames.map((pkg) => (
                  <Chip
                    key={pkg}
                    label={pkg}
                    onDelete={() => handlePackageSearch("")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </motion.div>
  );
}
