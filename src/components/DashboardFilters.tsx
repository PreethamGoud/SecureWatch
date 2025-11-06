/**
 * Dashboard Filters - Simplified, compact filters for dashboard view
 * Only essential filters: Severity, CVSS, Risk Factors, Groups, Repos
 */

import { useMemo } from "react";
import {
  Box,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ClearAll as ClearIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";

export default function DashboardFilters() {
  const { filters, setFilters, allVulnerabilities } = useVulnerabilities();

  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

  // Extract unique values from data
  const uniqueRiskFactors = useMemo(() => {
    const factors = new Set<string>();
    allVulnerabilities.forEach((vuln) => {
      Object.keys(vuln.riskFactors || {}).forEach((factor) =>
        factors.add(factor)
      );
    });
    return Array.from(factors).sort();
  }, [allVulnerabilities]);

  const uniqueGroups = useMemo(() => {
    const groups = new Set(allVulnerabilities.map((v) => v.groupName));
    return Array.from(groups).sort();
  }, [allVulnerabilities]);

  const uniqueRepositories = useMemo(() => {
    const repos = new Set(allVulnerabilities.map((v) => v.repoName));
    return Array.from(repos).sort();
  }, [allVulnerabilities]);

  // Handlers
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

  const clearAllFilters = () => {
    setFilters({
      severities: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"],
      cvssRange: [0, 10],
      packageNames: [],
      groups: [],
      repos: [],
      riskFactors: [],
      dateRange: undefined,
      excludeInvalidNoRisk: false,
      excludeAiInvalidNoRisk: false,
    });
  };

  const currentSeverities = filters.severities || severities;
  const currentCvssRange = filters.cvssRange || [0, 10];

  const hasActiveFilters =
    currentSeverities.length < 5 ||
    currentCvssRange[0] > 0 ||
    currentCvssRange[1] < 10 ||
    (filters.groups && filters.groups.length > 0) ||
    (filters.repos && filters.repos.length > 0) ||
    (filters.riskFactors && filters.riskFactors.length > 0) ||
    filters.excludeInvalidNoRisk ||
    filters.excludeAiInvalidNoRisk;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "#DC2626";
      case "HIGH":
        return "#EA580C";
      case "MEDIUM":
        return "#CA8A04";
      case "LOW":
        return "#2563EB";
      default:
        return "#9CA3AF";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            fullWidth
            variant="text"
            color="error"
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearAllFilters}
            sx={{ mb: 2, justifyContent: "flex-start" }}
          >
            Clear All
          </Button>
        )}

        {/* Severity Filter */}
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 40,
              "& .MuiAccordionSummary-content": { my: 0.5 },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Severity
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormGroup sx={{ gap: 0.5 }}>
              {severities.map((severity) => (
                <FormControlLabel
                  key={severity}
                  sx={{ ml: 0, mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={currentSeverities.includes(severity)}
                      onChange={() => handleSeverityToggle(severity)}
                      sx={{
                        py: 0.5,
                        color: alpha(getSeverityColor(severity), 0.5),
                        "&.Mui-checked": {
                          color: getSeverityColor(severity),
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.875rem",
                        color: currentSeverities.includes(severity)
                          ? "text.primary"
                          : "text.secondary",
                      }}
                    >
                      {severity}
                    </Typography>
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
              minHeight: 40,
              "& .MuiAccordionSummary-content": { my: 0.5 },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              CVSS Score
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 1 }}>
            <Box sx={{ px: 1 }}>
              <Slider
                value={currentCvssRange}
                onChange={handleCvssChange}
                valueLabelDisplay="auto"
                min={0}
                max={10}
                step={0.1}
                size="small"
                marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                ]}
                sx={{
                  "& .MuiSlider-thumb": {
                    width: 14,
                    height: 14,
                  },
                  "& .MuiSlider-markLabel": {
                    fontSize: "0.75rem",
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                Range: {currentCvssRange[0].toFixed(1)} -{" "}
                {currentCvssRange[1].toFixed(1)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Risk Factors */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 40,
              "& .MuiAccordionSummary-content": { my: 0.5 },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Risk Factors
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Autocomplete
              multiple
              size="small"
              options={uniqueRiskFactors}
              value={filters.riskFactors || []}
              onChange={(_event, newValue) => {
                setFilters({ ...filters, riskFactors: newValue as string[] });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      py: 0.5,
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{ height: 22, fontSize: "0.75rem" }}
                  />
                ))
              }
              sx={{
                "& .MuiAutocomplete-inputRoot": {
                  fontSize: "0.875rem",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Groups */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 40,
              "& .MuiAccordionSummary-content": { my: 0.5 },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Groups
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Autocomplete
              multiple
              size="small"
              options={uniqueGroups}
              value={filters.groups || []}
              onChange={(_event, newValue) => {
                setFilters({ ...filters, groups: newValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      py: 0.5,
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{ height: 22, fontSize: "0.75rem" }}
                  />
                ))
              }
              sx={{
                "& .MuiAutocomplete-inputRoot": {
                  fontSize: "0.875rem",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Repositories */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 40,
              "& .MuiAccordionSummary-content": { my: 0.5 },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Repositories
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Autocomplete
              multiple
              size="small"
              options={uniqueRepositories}
              value={filters.repos || []}
              onChange={(_event, newValue) => {
                setFilters({ ...filters, repos: newValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      py: 0.5,
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{ height: 22, fontSize: "0.75rem" }}
                  />
                ))
              }
              sx={{
                "& .MuiAutocomplete-inputRoot": {
                  fontSize: "0.875rem",
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </motion.div>
  );
}
