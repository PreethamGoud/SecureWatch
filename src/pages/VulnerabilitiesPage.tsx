/**
 * Vulnerabilities Page - Full table view with filters, comparison, and export
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Drawer,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Select,
  MenuItem,
  TextField,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Tune as FilterIcon,
  FileDownload as ExportIcon,
  CompareArrows as CompareIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import Layout from "../components/Layout";
import VulnerabilityTable from "../components/VulnerabilityTable";
import AnalysisButtons from "../components/AnalysisButtons";
import UnifiedFilters from "../components/UnifiedFilters";
import ComparisonPanel from "../components/ComparisonPanel";
import VulnerabilityDetailPanel from "../components/VulnerabilityDetailPanel";
import ExportDialog from "../components/ExportDialog";
import DataUploadDialog from "../components/DataUploadDialog";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import type { FlattenedVulnerability } from "../types/vulnerability";

interface VulnerabilitiesPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const filterDrawerWidth = 360;

export default function VulnerabilitiesPage({
  isDarkMode,
  toggleTheme,
}: VulnerabilitiesPageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {
    loadingState,
    filteredVulnerabilities,
    comparisonIds,
    sortConfig,
    setSortConfig,
    filters,
    setFilters,
  } = useVulnerabilities();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(!isMobile);
  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] =
    useState<FlattenedVulnerability | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Show loading screen if still loading/processing
  if (
    loadingState.status === "loading" ||
    loadingState.status === "processing"
  ) {
    return <LoadingScreen />;
  }

  // Show upload prompt if no data
  if (loadingState.status === "idle" || loadingState.status === "error") {
    return (
      <Layout
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onUploadClick={() => setUploadDialogOpen(true)}
      >
        <Box
          sx={{
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
            width: "100%",
          }}
        >
          <EmptyState
            variant="no-data"
            onAction={() => setUploadDialogOpen(true)}
          />
        </Box>
        <DataUploadDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
        />
      </Layout>
    );
  }

  // Check if filters removed all results
  const hasNoResults = filteredVulnerabilities.length === 0;

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleComparisonToggle = () => {
    if (comparisonIds.length === 0) {
      toast.info("Select vulnerabilities to compare");
      return;
    }
    setComparisonDrawerOpen(!comparisonDrawerOpen);
  };

  const handleViewDetails = (vulnerability: FlattenedVulnerability) => {
    setSelectedVulnerability(vulnerability);
    setDetailDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDrawerOpen(false);
    setTimeout(() => setSelectedVulnerability(null), 300); // Wait for animation
  };

  // Data is ready, show the full page
  return (
    <Layout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      onUploadClick={() => setUploadDialogOpen(true)}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width:
              filterDrawerOpen && !isMobile
                ? `calc(100% - ${filterDrawerWidth}px)`
                : "100%",
            minHeight: "calc(100vh - 64px)",
            transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              py: { xs: 2, sm: 3, md: 4 },
              px: { xs: 1.5, sm: 2, md: 3 },
              width: "100%",
            }}
          >
            {/* Header with Actions */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 2, sm: 2, md: 3 },
                mb: { xs: 3, md: 4 },
              }}
            >
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 auto" } }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  Vulnerabilities
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {filteredVulnerabilities.length.toLocaleString()} items found
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1, sm: 1.5 },
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {/* Search Field */}
                <TextField
                  size="small"
                  placeholder="Search CVE, Package, Repository, or Group.."
                  value={filters.packageNames?.[0] || ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      packageNames: e.target.value ? [e.target.value] : [],
                    });
                  }}
                  sx={{
                    minWidth: { xs: 250, sm: 350 },
                    minHeight: 44,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.875rem",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                  }}
                />

                <Tooltip title="Toggle Filters">
                  <IconButton
                    onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                    sx={{
                      bgcolor: filterDrawerOpen
                        ? alpha(theme.palette.primary.main, 0.15)
                        : "background.paper",
                      color: filterDrawerOpen ? "primary.main" : "text.primary",
                      border: 1,
                      borderColor: filterDrawerOpen
                        ? "primary.main"
                        : "divider",
                      minWidth: 44,
                      minHeight: 44,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: filterDrawerOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        borderColor: "primary.main",
                        transform: filterDrawerOpen
                          ? "rotate(180deg) scale(1.1)"
                          : "scale(1.1)",
                      },
                    }}
                  >
                    <FilterIcon />
                  </IconButton>
                </Tooltip>

                {/* Sort By Dropdown */}
                <Select
                  value={sortConfig?.field || "severity"}
                  onChange={(e) => {
                    if (setSortConfig) {
                      setSortConfig({
                        field: e.target.value as any,
                        direction: sortConfig?.direction || "desc",
                      });
                    }
                  }}
                  size="small"
                  sx={{
                    minWidth: 140,
                    minHeight: 44,
                    fontSize: "0.875rem",
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                >
                  <MenuItem value="severity">Sort: Severity</MenuItem>
                  <MenuItem value="cvss">Sort: CVSS</MenuItem>
                  <MenuItem value="published">Sort: Published</MenuItem>
                  <MenuItem value="repoName">Sort: Repository</MenuItem>
                </Select>

                {/* Sort Direction Toggle */}
                <Tooltip
                  title={
                    sortConfig?.direction === "asc" ? "Ascending" : "Descending"
                  }
                >
                  <IconButton
                    onClick={() => {
                      if (setSortConfig) {
                        setSortConfig({
                          field: sortConfig?.field || "severity",
                          direction:
                            sortConfig?.direction === "asc" ? "desc" : "asc",
                        });
                      }
                    }}
                    sx={{
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "divider",
                      minWidth: 44,
                      minHeight: 44,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {sortConfig?.direction === "asc" ? (
                      <ArrowUpIcon />
                    ) : (
                      <ArrowDownIcon />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title={`Compare (${comparisonIds.length} selected)`}>
                  <Button
                    variant={
                      comparisonIds.length > 0 ? "contained" : "outlined"
                    }
                    startIcon={<CompareIcon />}
                    onClick={handleComparisonToggle}
                    disabled={comparisonIds.length === 0}
                    sx={{
                      minHeight: 44,
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                      px: { xs: 2, sm: 2.5 },
                    }}
                  >
                    {isMobile
                      ? comparisonIds.length
                      : `Compare (${comparisonIds.length})`}
                  </Button>
                </Tooltip>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExport}
                  sx={{
                    minHeight: 44,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    px: { xs: 2, sm: 2.5 },
                  }}
                >
                  {isMobile ? "" : "Export"}
                </Button>
              </Box>
            </Box>

            {/* Vulnerability Table or Empty State */}
            {hasNoResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <EmptyState
                  variant="no-results"
                  onAction={() => setFilterDrawerOpen(true)}
                  actionLabel="Adjust Filters"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ width: "100%", overflow: "hidden" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    overflow: "auto",
                    width: "100%",
                  }}
                >
                  <VulnerabilityTable onViewDetails={handleViewDetails} />
                </Paper>
              </motion.div>
            )}
          </Box>
        </Box>

        {/* Filter Drawer (Right Side) */}
        <Box
          sx={{
            width: filterDrawerOpen && !isMobile ? filterDrawerWidth : 0,
            flexShrink: 0,
            transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            borderLeft:
              filterDrawerOpen && !isMobile
                ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                : "none",
            bgcolor: "background.default",
            boxShadow:
              filterDrawerOpen && !isMobile
                ? `0 0 20px ${alpha(theme.palette.common.black, 0.1)}`
                : "none",
          }}
        >
          {filterDrawerOpen && (
            <Box
              sx={{
                width: filterDrawerWidth,
                p: { xs: 2, md: 2.5 },
                height: "100%",
                overflow: "auto",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: { xs: 2, md: 2.5 },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}
                >
                  Filters
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setFilterDrawerOpen(false)}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Divider sx={{ mb: { xs: 2, md: 2.5 } }} />

              {/* Analysis Buttons */}
              <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
                <AnalysisButtons />
              </Box>

              <Divider sx={{ mb: { xs: 2, md: 2.5 } }} />

              {/* Unified Filters - with search and date range (sort in header) */}
              <UnifiedFilters showSearch showDateRange />
            </Box>
          )}
        </Box>

        {/* Mobile Drawer Overlay */}
        {isMobile && (
          <Drawer
            variant="temporary"
            anchor="right"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: "90%",
                maxWidth: 360,
                boxSizing: "border-box",
                bgcolor: "background.default",
                boxShadow: theme.shadows[8],
              },
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Filters
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setFilterDrawerOpen(false)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Analysis Buttons */}
              <Box sx={{ mb: 3 }}>
                <AnalysisButtons />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Unified Filters - with search and date range (sort in header) */}
              <UnifiedFilters showSearch showDateRange />
            </Box>
          </Drawer>
        )}

        {/* Detail Drawer (Right Side) */}
        <AnimatePresence>
          {detailDrawerOpen && selectedVulnerability && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "fixed",
                top: 64,
                bottom: 0,
                right: 0,
                width: isMobile ? "100%" : "600px",
                zIndex: 1300,
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                }}
              >
                <VulnerabilityDetailPanel
                  vulnerability={selectedVulnerability}
                  onClose={handleCloseDetail}
                />
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Drawer (Bottom) */}
        <AnimatePresence>
          {comparisonDrawerOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "fixed",
                top: 64,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  borderTop: `3px solid ${theme.palette.primary.main}`,
                }}
              >
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                  >
                    Comparison ({comparisonIds.length} selected)
                  </Typography>
                  <IconButton
                    onClick={() => setComparisonDrawerOpen(false)}
                    sx={{
                      minWidth: 44,
                      minHeight: 44,
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    height: "calc(100% - 70px)",
                    overflow: "auto",
                  }}
                >
                  <ComparisonPanel />
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Dialog */}
        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
        />

        {/* Upload Dialog */}
        <DataUploadDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
        />
      </Box>
    </Layout>
  );
}
