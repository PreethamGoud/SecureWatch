/**
 * Charts Grid Component - Visualizations for vulnerability data
 */

import { Grid, Paper, Typography, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
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
    Critical: theme.palette.error.main,
    High: theme.palette.warning.main,
    Medium: theme.palette.info.main,
    Low: theme.palette.success.main,
    Unknown: theme.palette.grey[500],
  };

  // Risk factors data (top 10)
  const riskFactorsData = Object.entries(metrics?.byRiskFactor || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      count: value,
    }));

  // Timeline data (last 12 months)
  const timelineData = (metrics?.timeline || []).slice(-12);

  return (
    <Grid container spacing={3}>
      {/* Severity Distribution Pie Chart */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 3,
              height: 350,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Severity Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { name, percent } = props;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
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
      </Grid>

      {/* Risk Factors Bar Chart */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Paper
            sx={{
              p: 3,
              height: 350,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Top Risk Factors
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskFactorsData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha(theme.palette.divider, 0.1)}
                />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                  style={{ textTransform: "capitalize" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={theme.palette.primary.main}
                  radius={[0, 4, 4, 0]}
                  animationBegin={0}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>
      </Grid>

      {/* Timeline Line Chart */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper
            sx={{
              p: 3,
              height: 350,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Published Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
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
    </Grid>
  );
}
