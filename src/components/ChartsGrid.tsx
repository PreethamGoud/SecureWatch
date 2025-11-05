/**
 * Charts Grid Component - Visualizations for vulnerability data
 * (Simplified version for initial implementation)
 */

import { Grid, Paper, Typography, Box } from "@mui/material";

export default function ChartsGrid() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Severity Distribution
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 250,
            }}
          >
            <Typography color="text.secondary">Chart coming soon...</Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Risk Factors
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 250,
            }}
          >
            <Typography color="text.secondary">Chart coming soon...</Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
