/**
 * Unified Filters - Single filter component for both Dashboard and Vulnerabilities pages
 * Configurable to show/hide specific filter sections
 */

import { useMemo } from "react";
import {
  Box,
  Typography,
  Slider,
  Chip,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Autocomplete,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ClearAll as ClearIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";

interface UnifiedFiltersProps {
  showSearch?: boolean;
  showSort?: boolean;
  showDateRange?: boolean;
}

export default function UnifiedFilters({
  showSearch = false,
  showSort = false,
  showDateRange = false,
}: UnifiedFiltersProps) {
  const { filters, setFilters, allVulnerabilities, sortConfig, setSortConfig } =
    useVulnerabilities();

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

  // Get active severities (inverted logic - selected = excluded)
  const activeSeverities = filters.severities || severities;
  const isActive = (severity: string) => activeSeverities.includes(severity);

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

  const handleSortChange = (field: string) => {
    if (setSortConfig) {
      setSortConfig({
        field: field as any,
        direction:
          sortConfig?.field === field && sortConfig?.direction === "asc"
            ? "desc"
            : "asc",
      });
    }
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
    if (setSortConfig) {
      setSortConfig({ field: "severity", direction: "desc" });
    }
  };

  const currentCvssRange = filters.cvssRange || [0, 10];

  const hasActiveFilters =
    activeSeverities.length < 5 ||
    currentCvssRange[0] > 0 ||
    currentCvssRange[1] < 10 ||
    (filters.packageNames && filters.packageNames.length > 0) ||
    (filters.groups && filters.groups.length > 0) ||
    (filters.repos && filters.repos.length > 0) ||
    (filters.riskFactors && filters.riskFactors.length > 0) ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) ||
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
      <Box sx={{ px: 2, py: 2 }}>
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

        {/* Severity Filter - Badge Buttons */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Severity
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {severities.map((severity) => (
              <Chip
                key={severity}
                label={severity}
                onClick={() => handleSeverityToggle(severity)}
                sx={{
                  height: 28,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  bgcolor: isActive(severity)
                    ? getSeverityColor(severity)
                    : "transparent",
                  color: isActive(severity) ? "#fff" : "text.secondary",
                  border: `1.5px solid ${getSeverityColor(severity)}`,
                  "&:hover": {
                    bgcolor: isActive(severity)
                      ? getSeverityColor(severity)
                      : `${getSeverityColor(severity)}22`,
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* CVSS Score Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            CVSS Score
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ px: 1 }}
          >
            <TextField
              size="small"
              value={currentCvssRange[0].toFixed(1)}
              disabled
              sx={{
                width: 70,
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                  bgcolor: "background.paper",
                },
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Slider
                value={currentCvssRange}
                onChange={handleCvssChange}
                valueLabelDisplay="auto"
                min={0}
                max={10}
                step={0.1}
                size="small"
                sx={{
                  "& .MuiSlider-thumb": {
                    width: 14,
                    height: 14,
                  },
                }}
              />
            </Box>
            <TextField
              size="small"
              value={currentCvssRange[1].toFixed(1)}
              disabled
              sx={{
                width: 70,
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                  bgcolor: "background.paper",
                },
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Risk Factors */}
        <Box sx={{ mb: 3 }}>
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
                placeholder="Risk Factors"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
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
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Groups */}
        <Box sx={{ mb: 3 }}>
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
                placeholder="Groups"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
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
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Repositories */}
        <Box sx={{ mb: 3 }}>
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
                placeholder="Repositories"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
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
          />
        </Box>

        {/* Global Search - Conditional */}
        {showSearch && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Search
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search CVE, package, repository, or group..."
                value={filters.packageNames?.[0] || ""}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    packageNames: e.target.value ? [e.target.value] : [],
                  });
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Box>
          </>
        )}

        {/* Sort By - Conditional */}
        {showSort && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Sort By
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={sortConfig?.field || "severity"}
                  onChange={(e) => handleSortChange(e.target.value)}
                  sx={{
                    fontSize: "0.875rem",
                  }}
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
                sx={{ mt: 0.5, display: "block", fontSize: "0.75rem" }}
              >
                Direction:{" "}
                {sortConfig?.direction === "asc" ? "Ascending" : "Descending"}
              </Typography>
            </Box>
          </>
        )}

        {/* Date Range - Conditional */}
        {showDateRange && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Published Date Range
              </Typography>
              <Stack spacing={1.5}>
                <DatePicker
                  label="From"
                  value={filters.dateRange?.start || null}
                  onChange={(newValue) => {
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: newValue || undefined,
                      },
                    });
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="To"
                  value={filters.dateRange?.end || null}
                  onChange={(newValue) => {
                    setFilters({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        end: newValue || undefined,
                      },
                    });
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </motion.div>
  );
}
