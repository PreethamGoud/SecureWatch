/**
 * Metrics Cards Component
 * Displays key performance indicators (KPIs) for vulnerabilities
 * Fully responsive with proper spacing and touch-friendly targets
 */

import { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Security as SecurityIcon,
  BugReport as BugIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { getSeverityColor } from "../theme/theme";

export default function MetricsCards() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { filteredVulnerabilities, allVulnerabilities } = useVulnerabilities();

  const metrics = useMemo(() => {
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let withExploit = 0;
    let withFix = 0;

    for (const vuln of filteredVulnerabilities) {
      bySeverity[vuln.severity] = (bySeverity[vuln.severity] || 0) + 1;
      byStatus[vuln.kaiStatus] = (byStatus[vuln.kaiStatus] || 0) + 1;
      if (vuln.exploit) withExploit++;
      if (vuln.fixDate) withFix++;
    }

    return {
      total: filteredVulnerabilities.length,
      totalAll: allVulnerabilities.length,
      critical: bySeverity.critical || 0,
      high: bySeverity.high || 0,
      medium: bySeverity.medium || 0,
      low: bySeverity.low || 0,
      withExploit,
      withFix,
      fixRate:
        filteredVulnerabilities.length > 0
          ? (withFix / filteredVulnerabilities.length) * 100
          : 0,
    };
  }, [filteredVulnerabilities, allVulnerabilities]);

  const cards = [
    {
      title: "Total Vulnerabilities",
      value: metrics.total.toLocaleString(),
      subtitle: `of ${metrics.totalAll.toLocaleString()} total`,
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(
        theme.palette.primary.main,
        0.1
      )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
    },
    {
      title: "Critical & High",
      value: (metrics.critical + metrics.high).toLocaleString(),
      subtitle: `${metrics.critical} critical, ${metrics.high} high`,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: getSeverityColor("critical"),
      bgGradient: `linear-gradient(135deg, ${alpha(
        getSeverityColor("critical"),
        0.1
      )} 0%, ${alpha(getSeverityColor("high"), 0.05)} 100%)`,
    },
    {
      title: "With Exploits",
      value: metrics.withExploit.toLocaleString(),
      subtitle: `${((metrics.withExploit / metrics.total) * 100 || 0).toFixed(
        1
      )}% of total`,
      icon: <BugIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      bgGradient: `linear-gradient(135deg, ${alpha(
        theme.palette.error.main,
        0.1
      )} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
    },
    {
      title: "Fixed",
      value: `${metrics.fixRate.toFixed(1)}%`,
      subtitle: `${metrics.withFix.toLocaleString()} have fixes`,
      icon: <CheckIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${alpha(
        theme.palette.success.main,
        0.1
      )} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
    },
  ];

  return (
    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                minHeight: { xs: 110, sm: 125, md: 140 },
                background: card.bgGradient,
                border: `1px solid ${alpha(card.color, 0.1)}`,
                borderRadius: 2,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                "&:hover": {
                  transform: isMobile ? "none" : "translateY(-4px)",
                  boxShadow: `0 8px 24px ${alpha(card.color, 0.15)}`,
                  borderColor: alpha(card.color, 0.3),
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  "&:last-child": { pb: { xs: 1.5, sm: 2, md: 2.5 } },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    height: "100%",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        color: card.color,
                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        display: "block",
                      }}
                    >
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: card.color,
                      opacity: 0.2,
                      ml: 1,
                      display: "flex",
                      alignItems: "center",
                      "& svg": {
                        fontSize: { xs: 36, sm: 40, md: 48 },
                      },
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}
