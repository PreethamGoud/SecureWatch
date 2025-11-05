/**
 * Main Dashboard page with metrics, visualizations, and vulnerability list
 * Features creative Analysis/AI Analysis filter buttons with visual feedback
 */

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Fab,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  CompareArrows as CompareIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import LoadingScreen from "../components/LoadingScreen";
import AnalysisButtons from "../components/AnalysisButtons";
import MetricsCards from "../components/MetricsCards";
import ChartsGrid from "../components/ChartsGrid";
import VulnerabilityTable from "../components/VulnerabilityTable";
import DataUploadDialog from "../components/DataUploadDialog";

const drawerWidth = 240;

export default function Dashboard() {
  const navigate = useNavigate();
  const { loadingState, loadData, comparisonIds } = useVulnerabilities();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Auto-load data from public folder if not loaded
  useEffect(() => {
    if (loadingState.status === "idle") {
      // Attempt to load from default location
      // You'll need to place ui_demo.json in public folder
      loadData("/ui_demo.json").catch((error) => {
        console.error("Failed to auto-load data:", error);
        // Show upload dialog if auto-load fails
        setUploadDialogOpen(true);
      });
    }
  }, [loadingState.status, loadData]);

  // Show loading screen while data is being processed
  if (
    loadingState.status === "loading" ||
    loadingState.status === "processing"
  ) {
    return <LoadingScreen />;
  }

  // Show upload prompt if no data
  if (loadingState.status === "idle" || loadingState.status === "error") {
    return (
      <>
        <LoadingScreen />
        <DataUploadDialog
          open={uploadDialogOpen || loadingState.status === "error"}
          onClose={() => setUploadDialogOpen(false)}
        />
      </>
    );
  }

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Search", icon: <SearchIcon />, path: "/search" },
    {
      text: "Comparison",
      icon: <CompareIcon />,
      path: "/comparison",
      badge: comparisonIds.length,
    },
    {
      text: "Upload Data",
      icon: <UploadIcon />,
      action: () => setUploadDialogOpen(true),
    },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "primary.main",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Security Vulnerability Dashboard
          </Typography>
          <Tooltip title="Upload Data">
            <IconButton
              color="inherit"
              onClick={() => setUploadDialogOpen(true)}
            >
              <UploadIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.path) {
                      navigate(item.path);
                    }
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="secondary">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />

        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Vulnerability Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive security analysis across all repositories and images
            </Typography>
          </Box>

          {/* Creative Analysis Buttons */}
          <Box sx={{ mb: 4 }}>
            <AnalysisButtons />
          </Box>

          {/* Metrics Cards */}
          <Box sx={{ mb: 4 }}>
            <MetricsCards />
          </Box>

          {/* Charts Grid */}
          <Box sx={{ mb: 4 }}>
            <ChartsGrid />
          </Box>

          {/* Vulnerability Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Vulnerability Details
            </Typography>
            <VulnerabilityTable />
          </Paper>
        </Container>

        {/* Floating Action Button for Comparison */}
        {comparisonIds.length > 0 && (
          <Fab
            color="secondary"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            onClick={() => navigate("/comparison")}
          >
            <Badge badgeContent={comparisonIds.length} color="error">
              <CompareIcon />
            </Badge>
          </Fab>
        )}
      </Box>

      {/* Upload Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </Box>
  );
}
