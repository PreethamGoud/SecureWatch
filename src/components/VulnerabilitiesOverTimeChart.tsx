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
  const { filteredVulnerabilities } = useVulnerabilities();

  // Process filtered vulnerabilities to create timeline data with open/fixed counts
  const timelineData = useMemo(() => {
    const monthlyData = new Map<string, { open: number; fixed: number }>();

    filteredVulnerabilities.forEach((vuln) => {
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
        Published: counts.open,
        Fixed: counts.fixed,
      }));
    return sortedData;
  }, [filteredVulnerabilities]);

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
            <defs>
              <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
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
              dataKey="Published"
              stackId="1"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#colorPublished)"
              animationBegin={0}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="Fixed"
              stackId="1"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorFixed)"
              animationBegin={0}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
}
