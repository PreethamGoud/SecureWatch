/**
 * Comparison Page - Side-by-side vulnerability comparison
 */

import { Box, Container, Typography } from "@mui/material";

export default function ComparisonPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vulnerability Comparison
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography color="text.secondary">
          Comparison interface coming soon...
        </Typography>
      </Box>
    </Container>
  );
}
