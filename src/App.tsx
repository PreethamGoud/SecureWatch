import { lazy, Suspense, useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VulnerabilityProvider } from "./context/VulnerabilityContext";
import { lightTheme, darkTheme } from "./theme/theme";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VulnerabilitiesPage = lazy(() => import("./pages/VulnerabilitiesPage"));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved === "dark";
  });

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme-mode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VulnerabilityProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                  />
                }
              />
              <Route
                path="/vulnerabilities"
                element={
                  <VulnerabilitiesPage
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                  />
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </VulnerabilityProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
    </ThemeProvider>
  );
}

export default App;
