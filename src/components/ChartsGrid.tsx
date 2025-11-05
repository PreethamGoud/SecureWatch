/**
 * Charts Grid Component - 5 Visualizations in custom layout
 * TOP: Severity (donut) + AI vs Manual (stacked bar) | Top Risk Factors (tall)
 * MIDDLE: Published Timeline (line)
 * BOTTOM: Vulnerabilities Over Time (stacked area)
 */

import { Grid, Paper, Typography, useTheme, alpha, Stack } from "@mui/material";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import AIvsManualChart from "./AIvsManualChart";
import TopRiskFactorsChart from "./TopRiskFactorsChart";
import VulnerabilitiesOverTimeChart from "./VulnerabilitiesOverTimeChart";

export default function ChartsGrid() {
  const theme = useTheme();
  const { metrics } = useVulnerabilities();

  // Severity distribution data
  const severityData = Object.entries(metrics?.bySeverity || {}).map(
    ([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    })
  );

  const severityColors: Record<string, string> = {
    Critical: "#DC2626", // Red
    High: "#EA580C", // Orange
    Medium: "#D97706", // Amber/Gold
    Low: "#2563EB", // Blue
    Unknown: theme.palette.grey[500],
  };

  // Custom label rendering for outside positioning
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={severityColors[name] || theme.palette.text.primary}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: "14px", fontWeight: 500 }}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Timeline data (last 12 months)
  const timelineData = (metrics?.timeline || []).slice(-12);

  return (
    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: "100%" }}>
      {/* TOP ROW: Left column (Severity + AI vs Manual) and Right column (Top Risk Factors) */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Severity Distribution Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3, md: 3.5 },
                height: { xs: 340, sm: 360, md: 380 },
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Severity Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    labelLine={true}
                    label={renderCustomLabel}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          severityColors[entry.name] || theme.palette.grey[500]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>

          {/* AI vs Manual Stacked Bar Chart */}
          <AIvsManualChart />
        </Stack>
      </Grid>

      {/* TOP ROW: Right column (Top Risk Factors - tall) */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <TopRiskFactorsChart />
      </Grid>

      {/* MIDDLE ROW: Published Timeline (full width) */}
      <Grid size={{ xs: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 3.5 },
              height: { xs: 360, sm: 380, md: 400 },
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Published Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha(theme.palette.divider, 0.1)}
                />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationBegin={0}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>
      </Grid>

      {/* BOTTOM ROW: Vulnerabilities Over Time (full width) */}
      <Grid size={{ xs: 12 }}>
        <VulnerabilitiesOverTimeChart />
      </Grid>
    </Grid>
  );
}
