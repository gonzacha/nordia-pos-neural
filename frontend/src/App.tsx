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
import ResponsiveLayout from "./components/Layout/ResponsiveLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import PosInterface from "./components/POS/PosInterface";
import ScannerPOS from "./components/POS/ScannerPOS";
import DiscreteScannerPOS from "./components/POS/DiscreteScannerPOS";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard";
import MobileAnalytics from "./components/Analytics/MobileAnalytics";
import PWAManager from "./components/PWA/PWAManager";
import NotificationSystem from "./components/UI/NotificationSystem";
import MobileDashboard from "./components/Mobile/MobileDashboard";
import { useMediaQuery } from "@mui/material";

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
              <ResponsiveLayout>
                <Routes>
                  <Route path="/" element={<SmartDashboard />} />
                  <Route path="/pos" element={<PosInterface />} />
                  <Route path="/scanner" element={<ScannerPOS />} />
                  <Route path="/discrete" element={<DiscreteScannerPOS />} />
                  <Route path="/analytics" element={<SmartAnalytics />} />
                  <Route path="/pwa" element={<PWAManager />} />
                </Routes>
              </ResponsiveLayout>

              {/* Sistema de notificaciones global */}
              <NotificationSystem />
            </Router>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StyledEngineProvider>
  );
}

// Componente que decide qué dashboard mostrar
const SmartDashboard = () => {
  const isMobile = useMediaQuery('(max-width:960px)'); // Aumentar breakpoint
  const [debugMode, setDebugMode] = React.useState(false);

  React.useEffect(() => {
    // Debug: mostrar información en console
    console.log(`📱 Mobile Detection: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
    console.log(`📐 Screen width: ${window.innerWidth}px`);

    // Permitir forzar modo móvil con URL param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mobile') === 'true') {
      setDebugMode(true);
    }
  }, [isMobile]);

  // Forzar modo móvil si está en URL o si es realmente móvil
  const shouldUseMobile = isMobile || debugMode || window.innerWidth <= 960;

  return shouldUseMobile ? <MobileDashboard /> : <Dashboard />;
};

// Componente que decide qué analytics mostrar
const SmartAnalytics = () => {
  const isMobile = useMediaQuery('(max-width:960px)');
  const shouldUseMobile = isMobile || window.innerWidth <= 960;

  return shouldUseMobile ? <MobileAnalytics /> : <AnalyticsDashboard />;
};

export default App;