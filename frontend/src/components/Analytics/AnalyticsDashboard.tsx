// components/Analytics/AnalyticsDashboard.tsx - DASHBOARD NEURAL SIMPLIFICADO
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  MonetizationOn,
  Inventory,
} from '@mui/icons-material';

// Custom components
import { NordiaCard } from '../UI';
import { useAppSelectors } from '../../context/AppContext';

// Types
interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  transactions: number;
  avgTicket: number;
}

interface CategoryData {
  category: string;
  sales: number;
  revenue: number;
  color: string;
}

interface KPIData {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

// Mock data para demostración
const generateSalesData = (): SalesData[] => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return days.map((day, index) => ({
    date: day,
    sales: Math.floor(Math.random() * 50) + 20,
    revenue: Math.floor(Math.random() * 15000) + 5000,
    transactions: Math.floor(Math.random() * 30) + 10,
    avgTicket: Math.floor(Math.random() * 800) + 200,
  }));
};

const generateCategoryData = (): CategoryData[] => [
  { category: 'Bebidas', sales: 45, revenue: 12500, color: '#10b981' },
  { category: 'Snacks', sales: 32, revenue: 8900, color: '#3b82f6' },
  { category: 'Lacteos', sales: 28, revenue: 7200, color: '#f59e0b' },
  { category: 'Otros', sales: 15, revenue: 3800, color: '#ef4444' },
];

export const AnalyticsDashboard: React.FC = () => {
  const { isOnline } = useAppSelectors();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  const salesData = useMemo(() => generateSalesData(), [timeRange]);
  const categoryData = useMemo(() => generateCategoryData(), []);

  const kpiData: KPIData[] = [
    {
      title: 'Ventas Hoy',
      value: '42',
      change: 12.5,
      trend: 'up',
      icon: <MonetizationOn />,
      color: '#10b981',
    },
    {
      title: 'Ingresos',
      value: '$18,450',
      change: 8.2,
      trend: 'up',
      icon: <TrendingUp />,
      color: '#3b82f6',
    },
    {
      title: 'Productos',
      value: '156',
      change: -2.1,
      trend: 'down',
      icon: <Inventory />,
      color: '#f59e0b',
    },
    {
      title: 'Neural Score',
      value: '94%',
      change: 5.8,
      trend: 'up',
      icon: <Psychology />,
      color: '#8b5cf6',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-AR')}`;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
          📊 Analytics Neural
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Insights en tiempo real con inteligencia artificial
        </Typography>

        {!isOnline && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            📱 Modo offline - Datos locales únicamente
          </Alert>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Período"
          >
            <MenuItem value="1d">Hoy</MenuItem>
            <MenuItem value="7d">7 días</MenuItem>
            <MenuItem value="30d">30 días</MenuItem>
            <MenuItem value="90d">90 días</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <NordiaCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: `${kpi.color}20`,
                      color: kpi.color,
                      mr: 2,
                    }}
                  >
                    {kpi.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.title}
                  </Typography>
                </Box>

                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {kpi.value}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp sx={{ color: '#10b981', mr: 0.5 }} />
                  ) : (
                    <TrendingDown sx={{ color: '#ef4444', mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: kpi.trend === 'up' ? '#10b981' : '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </Typography>
                </Box>
              </CardContent>
            </NordiaCard>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Trend */}
        <Grid item xs={12} md={8}>
          <NordiaCard>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                📈 Tendencia de Ventas
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Ingresos' : 'Ventas'
                  ]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Ingresos"
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Ventas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <NordiaCard>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                🎯 Ventas por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                    label={({ category, sales }) => `${category}: ${sales}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Neural Insights */}
        <Grid item xs={12}>
          <NordiaCard>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                🧠 Insights Neurales
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <strong>Oportunidad detectada:</strong> Aumentar stock de bebidas para el fin de semana (+15% demanda predicha)
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="info">
                    <strong>Patrón identificado:</strong> Pico de ventas entre 18:00-20:00. Considerar promociones en ese horario.
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="warning">
                    <strong>Optimización:</strong> Productos de bajo rotación detectados. Sugerir ofertas especiales.
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </NordiaCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;