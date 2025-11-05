/**
 * Main Layout Component with Header, Navigation, and Theme Toggle
 * Provides consistent layout across all pages
 */

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Switch,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  BugReport as VulnIcon,
  Upload as UploadIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onUploadClick?: () => void;
}

const drawerWidth = 260;

export default function Layout({
  children,
  isDarkMode,
  toggleTheme,
  onUploadClick,
}: LayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Vulnerabilities", icon: <VulnIcon />, path: "/vulnerabilities" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(10px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{
              mr: 2,
              color: "text.primary",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", alignItems: "center", flexGrow: 1 }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SecureWatch
            </Typography>
            <Typography
              variant="caption"
              sx={{
                ml: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontWeight: 600,
              }}
            >
              v1.0
            </Typography>
          </motion.div>

          {/* Theme Toggle */}
          <Tooltip
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <LightIcon
                sx={{ fontSize: 20, color: "text.secondary", mr: 1 }}
              />
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                color="primary"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.palette.secondary.main,
                  },
                }}
              />
              <DarkIcon sx={{ fontSize: 20, color: "text.secondary", ml: 1 }} />
            </Box>
          </Tooltip>

          {/* Upload Button */}
          <Tooltip title="Upload Data">
            <IconButton
              onClick={onUploadClick}
              sx={{
                color: "text.primary",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
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
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backdropFilter: "blur(10px)",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", p: 2 }}>
          <Typography
            variant="caption"
            sx={{ px: 2, color: "text.secondary", fontWeight: 600 }}
          >
            NAVIGATION
          </Typography>
          <List>
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&.Mui-selected": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.15
                          ),
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.2
                            ),
                          },
                        },
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08
                          ),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? "primary.main" : "text.secondary",
                          minWidth: 40,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "primary.main" : "text.primary",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              );
            })}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              px: 2,
              py: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              📊 STATISTICS
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "primary.main", fontWeight: 700, mt: 1 }}
            >
              Live Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Real-time vulnerability analysis with AI-powered insights
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: "calc(100vh - 64px)" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
