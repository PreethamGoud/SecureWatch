import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { VulnerabilityProvider } from "./context/VulnerabilityContext";
import { lightTheme } from "./theme/theme";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const VulnerabilityDetail = lazy(() => import("./pages/VulnerabilityDetail"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <VulnerabilityProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route
                path="/vulnerability/:id"
                element={<VulnerabilityDetail />}
              />
              <Route path="/comparison" element={<ComparisonPage />} />
            </Routes>
          </Suspense>
        </Router>
      </VulnerabilityProvider>
    </ThemeProvider>
  );
}

export default App;
