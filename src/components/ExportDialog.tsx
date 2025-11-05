/**
 * Export Dialog - Export filtered vulnerabilities to CSV/JSON/Excel
 */

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  LinearProgress,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { FileDownload as DownloadIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useVulnerabilities } from "../context/VulnerabilityContext";
import { exportToCSV, exportToJSON } from "../utils/export";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

type ExportFormat = "csv" | "json" | "excel";

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  const theme = useTheme();
  const { filteredVulnerabilities } = useVulnerabilities();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let filename: string;
      const timestamp = new Date().toISOString().split("T")[0];

      switch (format) {
        case "csv":
          filename = `vulnerabilities_${timestamp}.csv`;
          exportToCSV(filteredVulnerabilities, filename);
          break;
        case "json":
          filename = `vulnerabilities_${timestamp}.json`;
          exportToJSON(filteredVulnerabilities, filename);
          break;
        case "excel":
          toast.info("Excel export coming soon!");
          setExporting(false);
          return;
      }

      toast.success(
        `Exported ${filteredVulnerabilities.length} vulnerabilities to ${filename}`
      );
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DownloadIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Export Vulnerabilities
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Export the current filtered dataset (
            {filteredVulnerabilities.length.toLocaleString()} vulnerabilities)
          </Typography>
          <Chip
            label={`${filteredVulnerabilities.length.toLocaleString()} items`}
            size="small"
            color="primary"
            sx={{ mt: 1 }}
          />
        </Box>

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
            Export Format
          </FormLabel>
          <RadioGroup
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    CSV (Comma-Separated Values)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Compatible with Excel, Google Sheets, and data analysis
                    tools
                  </Typography>
                </Box>
              }
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                px: 2,
                py: 1,
                mb: 1,
                bgcolor:
                  format === "csv"
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "transparent",
              }}
            />
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    JSON (JavaScript Object Notation)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Structured data format for APIs and programming
                  </Typography>
                </Box>
              }
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                px: 2,
                py: 1,
                mb: 1,
                bgcolor:
                  format === "json"
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "transparent",
              }}
            />
            <FormControlLabel
              value="excel"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Excel (.xlsx)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Native Excel format with formatting (Coming Soon)
                  </Typography>
                </Box>
              }
              disabled
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                px: 2,
                py: 1,
                opacity: 0.5,
              }}
            />
          </RadioGroup>
        </FormControl>

        {exporting && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Preparing export...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={exporting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={exporting}
          startIcon={<DownloadIcon />}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
