/**
 * Top Risk Factors - Horizontal Bar Chart
 * Taller chart to span the height of left column (Severity + AI vs Manual)
 */

import { useMemo } from "react";
import { Paper, Typography, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useVulnerabilities } from "../context/VulnerabilityContext";

export default function TopRiskFactorsChart() {
  const theme = useTheme();
  const { filteredVulnerabilities } = useVulnerabilities();

  // Calculate risk factors from filtered vulnerabilities (top 10)
  const riskFactorsData = useMemo(() => {
    const byRiskFactor: Record<string, number> = {};

    filteredVulnerabilities.forEach((vuln) => {
      Object.keys(vuln.riskFactors || {}).forEach((factor) => {
        byRiskFactor[factor] = (byRiskFactor[factor] || 0) + 1;
      });
    });

    return Object.entries(byRiskFactor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        count: value,
      }));
  }, [filteredVulnerabilities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          height: { xs: 700, sm: 750, md: 790 },
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Top Risk Factors
        </Typography>
        <ResponsiveContainer width="100%" height={710}>
          <BarChart data={riskFactorsData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.divider, 0.1)}
            />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
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
  );
}
