import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { StyledEngineProvider } from '@mui/material/styles';

// Context y Theme
import { AppProvider } from "./context/AppContext";
import nordiaTheme from "./theme/nordiaTheme";

// Components
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import PosInterface from "./components/POS/PosInterface";
import ScannerPOS from "./components/POS/ScannerPOS";
import DiscreteScannerPOS from "./components/POS/DiscreteScannerPOS";
import NotificationSystem from "./components/UI/NotificationSystem";

// React Query config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={nordiaTheme}>
          <CssBaseline />
          <AppProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pos" element={<PosInterface />} />
                  <Route path="/scanner" element={<ScannerPOS />} />
                  <Route path="/discrete" element={<DiscreteScannerPOS />} />
                </Routes>
              </Layout>

              {/* Sistema de notificaciones global */}
              <NotificationSystem />
            </Router>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StyledEngineProvider>
  );
}

export default App;