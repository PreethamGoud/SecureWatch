/**
 * Dashboard Page - Overview with metrics and animated charts
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Tooltip,
  Divider,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import Layout from "../components/Layout";
import MetricsCards from "../components/MetricsCards";
import ChartsGrid from "../components/ChartsGrid";
import AnalysisButtons from "../components/AnalysisButtons";
import UnifiedFilters from "../components/UnifiedFilters";
import DataUploadDialog from "../components/DataUploadDialog";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";

interface DashboardProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const filterDrawerWidth = 360;

export default function Dashboard({ isDarkMode, toggleTheme }: DashboardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { loadingState, loadData, filteredVulnerabilities } =
    useVulnerabilities();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Auto-load data from public folder if not loaded
  useEffect(() => {
    if (loadingState.status === "idle") {
      // Check if file exists before trying to load
      fetch("/ui_demo.json", { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            loadData("/ui_demo.json").catch(() => {
              // Silently fail and show upload dialog
              setUploadDialogOpen(true);
            });
          } else {
            // File doesn't exist, just show upload dialog
            setUploadDialogOpen(true);
          }
        })
        .catch(() => {
          // Network error or file doesn't exist
          setUploadDialogOpen(true);
        });
    }
  }, [loadingState.status, loadData]);

  // Show loading screen while data is being loaded or processed
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
            px: { xs: 2, sm: 3, md: 4, lg: 5 },
            width: "100%",
          }}
        >
          <EmptyState
            variant="no-data"
            onAction={() => setUploadDialogOpen(true)}
          />
        </Box>
        <DataUploadDialog
          open={uploadDialogOpen || loadingState.status === "error"}
          onClose={() => setUploadDialogOpen(false)}
        />
      </Layout>
    );
  }

  // Show no results if filters removed everything
  const hasNoResults = filteredVulnerabilities.length === 0;

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
              px: { xs: 2, sm: 2.5, md: 3 },
              width: "100%",
            }}
          >
            {/* Header with Filter Toggle */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  mb: { xs: 1.5, md: 2 },
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    Dashboard
                  </Typography>
                </Box>
                <Tooltip title="Toggle Filters">
                  <IconButton
                    onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                    sx={{
                      minWidth: 44,
                      minHeight: 44,
                      bgcolor: filterDrawerOpen
                        ? alpha(theme.palette.primary.main, 0.15)
                        : "transparent",
                      color: filterDrawerOpen ? "primary.main" : "text.primary",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: filterDrawerOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        transform: filterDrawerOpen
                          ? "rotate(180deg) scale(1.1)"
                          : "scale(1.1)",
                      },
                    }}
                  >
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </motion.div>{" "}
            {/* Metrics Cards or Empty State */}
            {hasNoResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <EmptyState
                  variant="no-results"
                  onAction={() => setFilterDrawerOpen(true)}
                />
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                    <MetricsCards />
                  </Box>
                </motion.div>

                {/* Charts Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ChartsGrid />
                </motion.div>
              </>
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

              {/* Unified Filters - with date range only */}
              <UnifiedFilters showDateRange />
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

              {/* Unified Filters - with date range only */}
              <UnifiedFilters showDateRange />
            </Box>
          </Drawer>
        )}
      </Box>

      {/* Upload Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </Layout>
  );
}
