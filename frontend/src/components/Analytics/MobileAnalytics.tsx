// components/Analytics/MobileAnalytics.tsx - ANALYTICS MÓVIL PROFESIONAL
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useTheme } from '@mui/material';
import MobileDashboard from '../Mobile/MobileDashboard';
import MobileChartsContainer from '../Mobile/MobileCharts';

const MobileAnalytics: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Header móvil */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📊 Analytics Neural
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Datos en tiempo real optimizados para móvil
          </Typography>
        </Box>
      </motion.div>

      {/* Dashboard móvil */}
      <MobileDashboard />

      {/* Gráficos táctiles */}
      <MobileChartsContainer />
    </Box>
  );
};

export default MobileAnalytics;