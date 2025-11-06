/**
 * Main Layout Component with Header, Navigation, and Theme Toggle
 * Provides consistent responsive layout across all pages
 */

import type { ReactNode } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  ShieldOutlined as ShieldIcon,
  DeleteSweep as ClearCacheIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onUploadClick?: () => void;
}

export default function Layout({
  children,
  isDarkMode,
  toggleTheme,
  onUploadClick,
}: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", path: "/" },
    { text: "Vulnerabilities", path: "/vulnerabilities" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
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
          {/* Logo and Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: { xs: 1, md: 0 },
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShieldIcon
                sx={{
                  fontSize: { xs: 32, sm: 36 },
                  color: theme.palette.primary.main,
                  mr: 0.75,
                }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.5px",
                }}
              >
                SecureWatch
              </Typography>
            </motion.div>
            {!isMobile && (
              <Typography
                variant="caption"
                sx={{
                  ml: 1.5,
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
            )}
          </Box>

          {/* Desktop Navigation Links */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              gap: 1,
              ml: 6,
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color:
                    location.pathname === item.path
                      ? "primary.main"
                      : "text.primary",
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: "0.9375rem",
                  textTransform: "none",
                  px: 2,
                  minHeight: 44,
                  borderRadius: 2,
                  position: "relative",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                  "&::after":
                    location.pathname === item.path
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: 8,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "60%",
                          height: 2,
                          bgcolor: "primary.main",
                          borderRadius: 1,
                        }
                      : {},
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Theme Toggle Button */}
          <Tooltip
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "text.primary",
                minWidth: 44,
                minHeight: 44,
                mr: { xs: 0.5, sm: 1 },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {isDarkMode ? <LightIcon /> : <DarkIcon />}
            </IconButton>
          </Tooltip>

          {/* Clear Cache Button */}
          <Tooltip title="Clear Cache">
            <IconButton
              onClick={async () => {
                try {
                  const { isDatabasePopulated, clearDatabase } = await import(
                    "../utils/indexedDB"
                  );
                  const hasData = await isDatabasePopulated();

                  if (!hasData) {
                    alert("No cached data found.");
                    return;
                  }

                  if (
                    window.confirm(
                      "Clear all cached data? This will reload the page."
                    )
                  ) {
                    await clearDatabase();
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }
                } catch (error) {
                  console.error("Failed to clear cache:", error);
                  alert("Failed to clear cache.");
                }
              }}
              sx={{
                color: "text.primary",
                minWidth: 44,
                minHeight: 44,
                mr: { xs: 0.5, sm: 1 },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: "error.main",
                },
              }}
            >
              <ClearCacheIcon />
            </IconButton>
          </Tooltip>

          {/* Upload Button */}
          <Tooltip title="Upload Data">
            <IconButton
              onClick={onUploadClick}
              sx={{
                color: "text.primary",
                minWidth: 44,
                minHeight: 44,
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
          width: "100%",
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
