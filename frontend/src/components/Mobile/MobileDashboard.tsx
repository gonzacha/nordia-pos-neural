// components/Mobile/MobileDashboard.tsx - DASHBOARD MÓVIL PROFESIONAL
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  LinearProgress,
  Chip,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  Speed,
  AttachMoney,
  ShoppingCart,
  Analytics,
  TouchApp,
  Refresh,
  MoreVert,
} from '@mui/icons-material';

// Tipos
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

interface NeuralInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: 'opportunity' | 'alert' | 'insight';
}

// Card de Métrica Móvil Profesional
const MobileMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  color,
  delay = 0,
}) => {
  const theme = useTheme();

  const trendIcon = trend === 'up' ? <TrendingUp /> : trend === 'down' ? <TrendingDown /> : null;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 140,
          cursor: 'pointer',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: alpha(color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { color, fontSize: 24 }
              })}
            </Box>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVert />
            </IconButton>
          </Box>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 0.5,
              background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={0.5}>
              {trendIcon && React.cloneElement(trendIcon, {
                sx: { color: trendColor, fontSize: 18 }
              })}
              <Typography
                variant="caption"
                fontWeight="medium"
                sx={{ color: trendColor }}
              >
                {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{Math.abs(change)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              24h
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Insight Neural Móvil
const NeuralInsightCard: React.FC<{ insight: NeuralInsight; index: number }> = ({
  insight,
  index
}) => {
  const theme = useTheme();

  const typeColors = {
    opportunity: theme.palette.success.main,
    alert: theme.palette.warning.main,
    insight: theme.palette.info.main,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Box
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 2,
          background: alpha(typeColors[insight.type], 0.05),
          border: `1px solid ${alpha(typeColors[insight.type], 0.2)}`,
          position: 'relative',
        }}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: typeColors[insight.type],
              mt: 1,
              flexShrink: 0,
            }}
          />
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              {insight.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              {insight.description}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <LinearProgress
                variant="determinate"
                value={insight.confidence}
                sx={{
                  width: 60,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(typeColors[insight.type], 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: typeColors[insight.type],
                    borderRadius: 2,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {insight.confidence}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

// Dashboard Móvil Principal
const MobileDashboard: React.FC = () => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Datos simulados
  const metrics = [
    {
      title: 'Neural Score',
      value: '94%',
      change: 5.8,
      trend: 'up' as const,
      icon: <Psychology />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Ventas Hoy',
      value: '$12,450',
      change: 12.3,
      trend: 'up' as const,
      icon: <AttachMoney />,
      color: '#10b981',
    },
    {
      title: 'Transacciones',
      value: '186',
      change: 8.7,
      trend: 'up' as const,
      icon: <ShoppingCart />,
      color: '#f59e0b',
    },
    {
      title: 'Eficiencia',
      value: '98.2%',
      change: 2.1,
      trend: 'up' as const,
      icon: <Speed />,
      color: '#8b5cf6',
    },
  ];

  const neuralInsights: NeuralInsight[] = [
    {
      id: '1',
      title: 'Patrón de Compra Detectado',
      description: 'Incremento del 34% en productos lácteos los martes',
      confidence: 87,
      type: 'opportunity',
    },
    {
      id: '2',
      title: 'Optimización de Inventario',
      description: 'Recomendación: Reducir stock de categoria X en 15%',
      confidence: 92,
      type: 'insight',
    },
    {
      id: '3',
      title: 'Horario Peak Identificado',
      description: 'Mayor flujo entre 14:00-16:00 los fines de semana',
      confidence: 78,
      type: 'alert',
    },
  ];

  // Gestos swipe
  const handlers = useSwipeable({
    onSwipedDown: () => handleRefresh(),
    onSwipedLeft: () => setCurrentPage(prev => Math.min(prev + 1, 2)),
    onSwipedRight: () => setCurrentPage(prev => Math.max(prev - 1, 0)),
    trackMouse: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <Box {...handlers} sx={{ pb: 10, px: 2, pt: 2 }}>
      {/* Header Móvil */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          sx={{
            background: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 3,
            p: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                width: 48,
                height: 48,
              }}
            >
              <Psychology />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Neural POS
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dashboard Móvil
              </Typography>
            </Box>
          </Box>

          <motion.div
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ duration: 1, ease: "linear", repeat: refreshing ? Infinity : 0 }}
          >
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <Refresh />
            </IconButton>
          </motion.div>
        </Box>
      </motion.div>

      {/* Indicador de Páginas */}
      <Box display="flex" justifyContent="center" gap={1} mb={3}>
        {[0, 1, 2].map((page) => (
          <motion.div
            key={page}
            whileTap={{ scale: 0.8 }}
            onClick={() => setCurrentPage(page)}
          >
            <Box
              sx={{
                width: currentPage === page ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: currentPage === page
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.3),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          </motion.div>
        ))}
      </Box>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Página 0: Métricas Principales */}
          {currentPage === 0 && (
            <Grid container spacing={2}>
              {metrics.map((metric, index) => (
                <Grid item xs={6} key={metric.title}>
                  <MobileMetricCard {...metric} delay={index * 0.1} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Página 1: Insights Neurales */}
          {currentPage === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🧠 Insights Neurales
              </Typography>
              {neuralInsights.map((insight, index) => (
                <NeuralInsightCard key={insight.id} insight={insight} index={index} />
              ))}
            </Box>
          )}

          {/* Página 2: Acciones Rápidas */}
          {currentPage === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⚡ Acciones Rápidas
              </Typography>
              <Grid container spacing={2}>
                {[
                  { title: 'Escanear', icon: <TouchApp />, color: '#10b981' },
                  { title: 'Vender', icon: <ShoppingCart />, color: '#f59e0b' },
                  { title: 'Analytics', icon: <Analytics />, color: '#8b5cf6' },
                  { title: 'Neural', icon: <Psychology />, color: '#ef4444' },
                ].map((action, index) => (
                  <Grid item xs={6} key={action.title}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        sx={{
                          background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
                          border: `1px solid ${alpha(action.color, 0.2)}`,
                          borderRadius: 3,
                          cursor: 'pointer',
                          minHeight: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '50%',
                              background: alpha(action.color, 0.1),
                              display: 'inline-flex',
                              mb: 1,
                            }}
                          >
                            {React.cloneElement(action.icon, {
                              sx: { color: action.color, fontSize: 32 }
                            })}
                          </Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {action.title}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Hint de Gestos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            👆 Desliza • 👇 Refresh
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default MobileDashboard;