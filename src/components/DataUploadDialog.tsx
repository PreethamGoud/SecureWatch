/**
 * Data Upload Dialog
 * Allows users to upload JSON data file or specify URL
 */

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Tab,
  Tabs,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import { getDataLoader } from "../utils/dataLoader";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DataUploadDialog({ open, onClose }: Props) {
  const [tabValue, setTabValue] = useState(0);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    try {
      const loader = getDataLoader();
      await loader.loadFromFile(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
    }
  };

  const handleUrlLoad = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    try {
      const loader = getDataLoader();
      await loader.loadFromURL(url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load from URL");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Load Vulnerability Data</DialogTitle>
      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Upload File" />
          <Tab label="Load from URL" />
        </Tabs>

        {tabValue === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              size="large"
            >
              Choose JSON File
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Upload the ui_demo.json vulnerability data file
            </Typography>
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="JSON File URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/ui_demo.json"
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter the URL to the JSON file (must be accessible via CORS)
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {tabValue === 1 && (
          <Button onClick={handleUrlLoad} variant="contained">
            Load
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
