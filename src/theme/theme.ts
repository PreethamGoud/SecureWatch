/**
 * Material-UI theme configuration
 * Defines colors, typography, and component styles
 */

import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

// Severity colors matching security standards
export const severityColors = {
  critical: "#d32f2f",
  high: "#f57c00",
  medium: "#fbc02d",
  low: "#388e3c",
  negligible: "#757575",
};

// Custom color palette for dashboard
const lightPalette = {
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
  },
  secondary: {
    main: "#9c27b0",
    light: "#ba68c8",
    dark: "#7b1fa2",
  },
  error: {
    main: severityColors.critical,
  },
  warning: {
    main: severityColors.high,
  },
  info: {
    main: "#0288d1",
  },
  success: {
    main: severityColors.low,
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
  },
};

const darkPalette = {
  primary: {
    main: "#90caf9",
    light: "#e3f2fd",
    dark: "#42a5f5",
  },
  secondary: {
    main: "#ce93d8",
    light: "#f3e5f5",
    dark: "#ab47bc",
  },
  error: {
    main: "#f44336",
  },
  warning: {
    main: "#ff9800",
  },
  info: {
    main: "#29b6f6",
  },
  success: {
    main: "#66bb6a",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
};

const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "light",
    ...lightPalette,
  },
});

export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "dark",
    ...darkPalette,
  },
});

/**
 * Get color by severity level
 */
export function getSeverityColor(severity: string): string {
  return (
    severityColors[severity as keyof typeof severityColors] ||
    severityColors.negligible
  );
}

/**
 * Get MUI color variant by severity
 */
export function getSeverityVariant(
  severity: string
): "error" | "warning" | "info" | "success" | "default" {
  switch (severity) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
      return "success";
    default:
      return "default";
  }
}
