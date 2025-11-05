/**
 * Vulnerabilities Over Time - Stacked Area Chart
 * Shows trend of open (red) and fixed (green) vulnerabilities over time
 */

import { Paper, Typography, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { useMemo } from "react";

export default function VulnerabilitiesOverTimeChart() {
  const theme = useTheme();
  const { allVulnerabilities } = useVulnerabilities();

  // Process vulnerabilities to create timeline data with open/fixed counts
  const timelineData = useMemo(() => {
    const monthlyData = new Map<string, { open: number; fixed: number }>();

    allVulnerabilities.forEach((vuln) => {
      if (vuln.publishedDate) {
        const monthKey = `${vuln.publishedDate.getFullYear()}-${String(
          vuln.publishedDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { open: 0, fixed: 0 });
        }

        const data = monthlyData.get(monthKey)!;

        // Count as fixed if fixDate exists and is not empty
        if (vuln.fixDate && vuln.fixDate.trim() !== "") {
          data.fixed++;
        } else {
          data.open++;
        }
      }
    });

    // Convert to array and sort by date
    const sortedData = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([month, counts]) => ({
        month,
        Open: counts.open,
        Fixed: counts.fixed,
      }));

    return sortedData;
  }, [allVulnerabilities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          height: { xs: 360, sm: 380, md: 400 },
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Vulnerabilities Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={timelineData}>
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
            <Area
              type="monotone"
              dataKey="Open"
              stackId="1"
              stroke={theme.palette.error.main}
              fill={theme.palette.error.main}
              fillOpacity={0.6}
              animationBegin={0}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="Fixed"
              stackId="1"
              stroke={theme.palette.success.main}
              fill={theme.palette.success.main}
              fillOpacity={0.6}
              animationBegin={0}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
}
