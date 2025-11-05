/**
 * Comparison Panel - Side-by-side vulnerability comparison
 */

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { getAllVulnerabilities } from "../utils/indexedDB";
import EmptyState from "./EmptyState";
import type { FlattenedVulnerability } from "../types/vulnerability";

export default function ComparisonPanel() {
  const theme = useTheme();
  const { comparisonIds, removeFromComparison } = useVulnerabilities();
  const [comparisonData, setComparisonData] = useState<
    FlattenedVulnerability[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (comparisonIds.length === 0) {
        setComparisonData([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch all vulnerabilities and filter by comparison IDs
        const allVulns = await getAllVulnerabilities();
        const selected = allVulns.filter((v: FlattenedVulnerability) =>
          comparisonIds.includes(v.id)
        );
        setComparisonData(selected);
      } catch (error) {
        console.error("Failed to fetch comparison data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [comparisonIds]);

  if (comparisonIds.length === 0) {
    return <EmptyState variant="no-comparison" />;
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Loading comparison data...
        </Typography>
      </Box>
    );
  }

  const comparisonFields = [
    { key: "cve", label: "CVE ID" },
    { key: "severity", label: "Severity" },
    { key: "cvss", label: "CVSS Score" },
    { key: "packageName", label: "Package" },
    { key: "installedVersion", label: "Installed Version" },
    { key: "fixedVersion", label: "Fixed Version" },
    { key: "riskFactors", label: "Risk Factors" },
    { key: "kaiStatus", label: "KAI Status" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return theme.palette.error.main;
      case "HIGH":
        return theme.palette.warning.main;
      case "MEDIUM":
        return theme.palette.info.main;
      case "LOW":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const renderCellValue = (vuln: FlattenedVulnerability, field: string) => {
    switch (field) {
      case "severity":
        return (
          <Chip
            label={vuln.severity}
            size="small"
            sx={{
              fontWeight: "bold",
              bgcolor: alpha(getSeverityColor(vuln.severity), 0.1),
              color: getSeverityColor(vuln.severity),
            }}
          />
        );
      case "cvss":
        return vuln.cvss?.toFixed(1) || "N/A";
      case "riskFactors":
        return Object.keys(vuln.riskFactors).length > 0 ? (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {Object.keys(vuln.riskFactors).map((rf, idx) => (
              <Chip key={idx} label={rf} size="small" variant="outlined" />
            ))}
          </Box>
        ) : (
          "None"
        );
      case "kaiStatus":
        return (
          <Chip
            label={vuln.kaiStatus}
            size="small"
            color={vuln.kaiStatus === "Valid" ? "success" : "default"}
            variant="outlined"
          />
        );
      default:
        return String(vuln[field as keyof FlattenedVulnerability] || "N/A");
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  Field
                </TableCell>
                {comparisonData.map((vuln) => (
                  <TableCell
                    key={vuln.id}
                    sx={{
                      fontWeight: "bold",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {vuln.cve}
                      </Typography>
                      <Tooltip title="Remove from comparison">
                        <IconButton
                          size="small"
                          onClick={() => removeFromComparison(vuln.id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonFields.map((field) => (
                <TableRow key={field.key} hover>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    {field.label}
                  </TableCell>
                  {comparisonData.map((vuln) => (
                    <TableCell key={vuln.id}>
                      {renderCellValue(vuln, field.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </AnimatePresence>
  );
}
