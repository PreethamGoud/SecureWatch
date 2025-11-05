/**
 * Advanced Filters - Severity, CVSS, Package, Date Range, Risk Factors, Groups, Repositories, Sort
 */

import { useState, useMemo } from "react";
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
  Select,
  MenuItem,
  FormControl,
  Button,
  Autocomplete,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";

export default function AdvancedFilters() {
  const theme = useTheme();
  const { filters, setFilters, allVulnerabilities, sortConfig, setSortConfig } =
    useVulnerabilities();
  const [searchTerm, setSearchTerm] = useState("");

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

  const handlePackageSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, packageNames: value ? [value] : [] });
  };

  const handleSortChange = (field: string) => {
    setSortConfig({
      field: field as any,
      direction:
        sortConfig?.field === field && sortConfig?.direction === "asc"
          ? "desc"
          : "asc",
    });
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
    setSearchTerm("");
    setSortConfig({ field: "severity", direction: "desc" });
  };

  const currentSeverities = filters.severities || severities;
  const currentCvssRange = filters.cvssRange || [0, 10];
  const currentPackageNames = filters.packageNames || [];

  const hasActiveFilters =
    currentSeverities.length < 5 ||
    currentCvssRange[0] > 0 ||
    currentCvssRange[1] < 10 ||
    currentPackageNames.length > 0 ||
    (filters.groups && filters.groups.length > 0) ||
    (filters.repos && filters.repos.length > 0) ||
    (filters.riskFactors && filters.riskFactors.length > 0) ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) ||
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

        {/* Sort By */}
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
              Sort By
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <FormControl fullWidth size="small">
              <Select
                value={sortConfig?.field || "severity"}
                onChange={(e) => handleSortChange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="severity">Severity</MenuItem>
                <MenuItem value="cvss">CVSS Score</MenuItem>
                <MenuItem value="published">Published Date</MenuItem>
                <MenuItem value="repoName">Repository</MenuItem>
              </Select>
            </FormControl>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Direction:{" "}
              {sortConfig?.direction === "asc" ? "Ascending" : "Descending"}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Risk Factors */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Risk Factors
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <Autocomplete
              multiple
              size="small"
              options={uniqueRiskFactors}
              value={filters.riskFactors || []}
              onChange={(_event, newValue) => {
                setFilters({ ...filters, riskFactors: newValue as string[] });
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select risk factors" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </AccordionDetails>
        </Accordion>

        {/* Groups */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Groups
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <Autocomplete
              multiple
              size="small"
              options={uniqueGroups}
              value={filters.groups || []}
              onChange={(_event, newValue) => {
                setFilters({ ...filters, groups: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select groups" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />
          </AccordionDetails>
        </Accordion>

        {/* Repositories */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Repositories
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <Autocomplete
              multiple
              size="small"
              options={uniqueRepositories}
              value={filters.repos || []}
              onChange={(_event, newValue) => {
                setFilters({ ...filters, repos: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select repositories" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ))
              }
            />
          </AccordionDetails>
        </Accordion>

        {/* Date Range */}
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: 48,
              "& .MuiAccordionSummary-content": { my: 1 },
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Published Date Range
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <Stack spacing={2}>
              <TextField
                label="From"
                type="date"
                size="small"
                value={
                  filters.dateRange?.start
                    ? new Date(filters.dateRange.start)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    },
                  });
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="To"
                type="date"
                size="small"
                value={
                  filters.dateRange?.end
                    ? new Date(filters.dateRange.end)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      end: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    },
                  });
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Clear All Button */}
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
          >
            Clear All Filters
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
}
