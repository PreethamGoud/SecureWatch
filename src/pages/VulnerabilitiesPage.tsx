/**
 * Vulnerabilities Page - Full table view with filters, comparison, and export
 */

import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Drawer,
  IconButton,
  Tooltip,
  Button,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  CompareArrows as CompareIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import Layout from "../components/Layout";
import VulnerabilityTable from "../components/VulnerabilityTable";
import AnalysisButtons from "../components/AnalysisButtons";
import AdvancedFilters from "../components/AdvancedFilters";
import ComparisonPanel from "../components/ComparisonPanel";
import ExportDialog from "../components/ExportDialog";
import DataUploadDialog from "../components/DataUploadDialog";
import LoadingScreen from "../components/LoadingScreen";
import TableSkeleton from "../components/TableSkeleton";
import EmptyState from "../components/EmptyState";

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
  const { loadingState, filteredVulnerabilities, comparisonIds } =
    useVulnerabilities();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(true);
  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Show loading screen if still loading/processing
  if (loadingState.status === "loading") {
    return <LoadingScreen />;
  }

  // Show skeleton during processing
  if (loadingState.status === "processing") {
    return (
      <Layout
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onUploadClick={() => setUploadDialogOpen(true)}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Vulnerabilities
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Loading data...
            </Typography>
          </Box>
          <TableSkeleton rows={15} columns={7} />
        </Container>
      </Layout>
    );
  }

  // Show upload prompt if no data
  if (loadingState.status === "idle" || loadingState.status === "error") {
    return (
      <Layout
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onUploadClick={() => setUploadDialogOpen(true)}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <EmptyState
            variant="no-data"
            onAction={() => setUploadDialogOpen(true)}
          />
        </Container>
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

  // Data is ready, show the full page
  return (
    <Layout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      onUploadClick={() => setUploadDialogOpen(true)}
    >
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: "margin 0.3s ease",
            mr: filterDrawerOpen ? `${filterDrawerWidth}px` : 0,
            position: "relative",
          }}
        >
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header with Actions */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Vulnerabilities
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {filteredVulnerabilities.length.toLocaleString()}{" "}
                  vulnerabilities found
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Toggle Filters">
                    <IconButton
                      onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                      sx={{
                        bgcolor: filterDrawerOpen
                          ? alpha(theme.palette.primary.main, 0.1)
                          : "transparent",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Compare Selected">
                    <IconButton
                      onClick={handleComparisonToggle}
                      sx={{
                        position: "relative",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        },
                      }}
                    >
                      <CompareIcon />
                      {comparisonIds.length > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "error.main",
                            color: "white",
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        >
                          {comparisonIds.length}
                        </Box>
                      )}
                    </IconButton>
                  </Tooltip>

                  <Button
                    variant="contained"
                    startIcon={<ExportIcon />}
                    onClick={handleExport}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Export
                  </Button>
                </Box>
              </motion.div>
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
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <VulnerabilityTable />
                </Paper>
              </motion.div>
            )}
          </Container>
        </Box>

        {/* Filter Drawer (Right Side) */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={filterDrawerOpen}
          sx={{
            width: filterDrawerOpen ? filterDrawerWidth : 0,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: filterDrawerWidth,
              boxSizing: "border-box",
              top: 64,
              height: "calc(100% - 64px)",
              border: "none",
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: "background.default",
            },
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

            {/* Advanced Filters */}
            <AdvancedFilters />
          </Box>
        </Drawer>

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
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  maxHeight: "50vh",
                  overflow: "hidden",
                  borderTop: `3px solid ${theme.palette.primary.main}`,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Comparison ({comparisonIds.length} selected)
                  </Typography>
                  <IconButton onClick={() => setComparisonDrawerOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    maxHeight: "calc(50vh - 60px)",
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
