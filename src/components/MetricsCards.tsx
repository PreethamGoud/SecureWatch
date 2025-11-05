/**
 * Metrics Cards Component
 * Displays key performance indicators (KPIs) for vulnerabilities
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
} from "@mui/material";
import {
  Security as SecurityIcon,
  BugReport as BugIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { getSeverityColor } from "../theme/theme";

export default function MetricsCards() {
  const theme = useTheme();
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
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              background: card.bgGradient,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ color: card.color }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box sx={{ color: card.color, opacity: 0.6 }}>{card.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
