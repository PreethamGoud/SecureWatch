/**
 * AI vs Manual Analysis - Stacked Bar Chart by Severity
 * Shows AI vs Manual breakdown for each severity level
 */

import { Paper, Typography, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { useMemo } from "react";

export default function AIvsManualChart() {
  const theme = useTheme();
  const { filteredVulnerabilities } = useVulnerabilities();

  // Process filtered vulnerabilities by severity, categorizing as AI vs Manual
  const data = useMemo(() => {
    if (!filteredVulnerabilities || filteredVulnerabilities.length === 0) {
      return [
        { name: "Critical", "AI analysis": 0, "Manual review": 0 },
        { name: "High", "AI analysis": 0, "Manual review": 0 },
        { name: "Medium", "AI analysis": 0, "Manual review": 0 },
        { name: "Low", "AI analysis": 0, "Manual review": 0 },
        { name: "Unknown", "AI analysis": 0, "Manual review": 0 },
      ];
    }

    const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"];

    return severities.map((severity) => {
      const severityVulns = filteredVulnerabilities.filter(
        (v) => v.severity?.toUpperCase() === severity
      );

      const aiCount = severityVulns.filter((v) =>
        v.kaiStatus?.toLowerCase().includes("ai")
      ).length;

      const manualCount = severityVulns.length - aiCount;

      return {
        name: severity.charAt(0) + severity.slice(1).toLowerCase(),
        "AI analysis": aiCount,
        "Manual review": manualCount,
      };
    });
  }, [filteredVulnerabilities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          height: { xs: 340, sm: 360, md: 380 },
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          AI vs Manual Analysis
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.divider, 0.1)}
            />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Legend />
            <Bar
              dataKey="AI analysis"
              stackId="a"
              fill={theme.palette.secondary.main}
              animationBegin={0}
              animationDuration={800}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Manual review"
              stackId="a"
              fill={theme.palette.primary.main}
              animationBegin={0}
              animationDuration={800}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
}
