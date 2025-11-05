/**
 * Dashboard Page - Overview with metrics and animated charts
 */

import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Drawer,
  IconButton,
  Tooltip,
  Divider,
  alpha,
  useTheme,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import Layout from "../components/Layout";
import MetricsCards from "../components/MetricsCards";
import ChartsGrid from "../components/ChartsGrid";
import AnalysisButtons from "../components/AnalysisButtons";
import AdvancedFilters from "../components/AdvancedFilters";
import DataUploadDialog from "../components/DataUploadDialog";
import LoadingScreen from "../components/LoadingScreen";
import MetricCardSkeleton from "../components/MetricCardSkeleton";
import ChartSkeleton from "../components/ChartSkeleton";
import EmptyState from "../components/EmptyState";

interface DashboardProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const filterDrawerWidth = 360;

export default function Dashboard({ isDarkMode, toggleTheme }: DashboardProps) {
  const theme = useTheme();
  const { loadingState, loadData, filteredVulnerabilities } =
    useVulnerabilities();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Auto-load data from public folder if not loaded
  useEffect(() => {
    if (loadingState.status === "idle") {
      loadData("/ui_demo.json").catch((error) => {
        console.error("Failed to auto-load data:", error);
        toast.info("Please upload your vulnerability data to get started");
        setUploadDialogOpen(true);
      });
    }
  }, [loadingState.status, loadData]);

  // Show loading screen while data is being processed
  if (loadingState.status === "loading") {
    return <LoadingScreen />;
  }

  // Show skeletons during processing
  if (loadingState.status === "processing") {
    return (
      <Layout
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onUploadClick={() => setUploadDialogOpen(true)}
      >
        <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              transition: "margin 0.3s ease",
            }}
          >
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Box sx={{ mb: 4 }}>
                <Skeleton
                  variant="text"
                  width="30%"
                  height={40}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="50%" height={24} />
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCardSkeleton />
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ChartSkeleton variant="pie" />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <ChartSkeleton variant="bar" />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <ChartSkeleton variant="line" />
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
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
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: "margin 0.3s ease",
            mr: filterDrawerOpen ? `${filterDrawerWidth}px` : 0,
          }}
        >
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header with Filter Toggle */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h4" gutterBottom fontWeight="bold">
                    Security Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Comprehensive vulnerability analysis and risk assessment
                  </Typography>
                </Box>
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
              </Box>
            </motion.div>

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
                  <Box sx={{ mb: 4 }}>
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
      </Box>

      {/* Upload Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </Layout>
  );
}
