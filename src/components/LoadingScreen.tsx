/**
 * Loading screen component with progress indicator
 */

import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useVulnerabilities } from "../context/VulnerabilityContext";

export default function LoadingScreen() {
  const { loadingState } = useVulnerabilities();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />

      <Typography variant="h5" gutterBottom>
        {loadingState.message || "Loading..."}
      </Typography>

      {loadingState.progress > 0 && (
        <Box sx={{ width: "100%", maxWidth: 400, mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={loadingState.progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            {Math.round(loadingState.progress)}%
          </Typography>
        </Box>
      )}

      {loadingState.error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Error: {loadingState.error}
        </Typography>
      )}
    </Box>
  );
}
