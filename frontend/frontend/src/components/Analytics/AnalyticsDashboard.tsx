// components/Analytics/AnalyticsDashboard.tsx - DASHBOARD NEURAL AVANZADO
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
  ToggleButton,
  ToggleButtonGroup,
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
  RechartsFunction,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  LocalFireDepartment,
  Schedule,
  Analytics as AnalyticsIcon,
  MonetizationOn,
  Inventory,
} from '@mui/icons-material';

// Custom components
import { NordiaCard, GradientText, AnimatedWrapper } from '../UI/UIComponents';
import { useAppSelectors } from '../../context/AppContext';
import { useNordiaColors } from '../../theme/nordiaTheme';

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

interface HourlyData {
  hour: string;
  sales: number;
  neural_prediction: number;
}

interface KPIData {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const colors = useNordiaColors();
  const { isOnline, completedSalesCount } = useAppSelectors();
  
  // State
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [viewMode, setViewMode] = useState<'sales' | 'revenue' | 'neural'>('sales');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    sales: SalesData[];
    categories: CategoryData[];
    hourly: HourlyData[];
    kpis: KPIData[];
  } | null>(null);

  // Simulate real-time data fetching
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data based on time range
      const data = generateMockAnalytics(timeRange);
      setAnalyticsData(data);
      setIsLoading(false);
    };

    fetchAnalytics();
    
    // Update every 30 seconds for real-time feel
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange, completedSalesCount]);

  // Generate mock analytics data
  const generateMockAnalytics = (range: string) => {
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    
    // Sales over time
    const salesData: SalesData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseSales = 15 + Math.random() * 25;
      const weekendMultiplier = [0, 6].includes(date.getDay()) ? 1.3 : 1;
      const sales = Math.floor(baseSales * weekendMultiplier);
      const avgTicket = 850 + Math.random() * 400;
      
      salesData.push({
        date: range === '24h' ? date.getHours() + ':00' : date.toLocaleDateString('es-AR'),
        sales,
        revenue: sales * avgTicket,
        transactions: sales,
        avgTicket: Math.round(avgTicket),
      });
    }

    // Category breakdown
    const categoryData: CategoryData[] = [
      { category: 'Bebidas', sales: 145, revenue: 98500, color: colors.primary[500] },
      { category: 'Snacks', sales: 89, revenue: 67800, color: colors.secondary[500] },
      { category: 'Lácteos', sales: 67, revenue: 45300, color: colors.success },
      { category: 'Panadería', sales: 54, revenue: 32100, color: colors.warning },
      { category: 'Limpieza', sales: 23, revenue: 19800, color: colors.error },
      { category: 'Otros', sales: 31, revenue: 21400, color: colors.gray[500] },
    ];

    // Hourly pattern with neural predictions
    const hourlyData: HourlyData[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      const baseSales = hour < 12 ? 2 + Math.random() * 3 : 
                      hour < 18 ? 4 + Math.random() * 6 : 
                      3 + Math.random() * 4;
      
      hourlyData.push({
        hour: `${hour}:00`,
        sales: Math.round(baseSales),
        neural_prediction: Math.round(baseSales * (0.9 + Math.random() * 0.2)),
      });
    }

    // KPIs
    const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
    const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const kpis: KPIData[] = [
      {
        title: 'Ventas Totales',
        value: totalSales,
        change: 12.5,
        trend: 'up',
        icon: <MonetizationOn />,
        color: colors.primary[500],
      },
      {
        title: 'Ingresos',
        value: `$${Math.round(totalRevenue).toLocaleString('es-AR')}`,
        change: 8.3,
        trend: 'up',
        icon: <TrendingUp />,
        color: colors.success,
      },
      {
        title: 'Ticket Promedio',
        value: `$${Math.round(avgTicket).toLocaleString('es-AR')}`,
        change: -2.1,
        trend: 'down',
        icon: <AnalyticsIcon />,
        color: colors.warning,
      },
      {
        title: 'Productos en Stock',
        value: 1247,
        change: 0,
        trend: 'stable',
        icon: <Inventory />,
        color: colors.info,
      },
    ];

    return { sales: salesData, categories: categoryData, hourly: hourlyData, kpis };
  };

  // Chart configurations
  const chartColors = [
    colors.primary[500],
    colors.secondary[500],
    colors.success,
    colors.warning,
    colors.error,
    colors.info,
  ];

  // Render KPI cards
  const renderKPICards = () => (
    <Grid container spacing={3}>
      {analyticsData?.kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={kpi.title}>
          <AnimatedWrapper delay={index * 100}>
            <NordiaCard hover>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={kpi.color}>
                      {kpi.value}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp sx={{ color: colors.success, fontSize: 16, mr: 0.5 }} />
                      ) : kpi.trend === 'down' ? (
                        <TrendingDown sx={{ color: colors.error, fontSize: 16, mr: 0.5 }} />
                      ) : null}
                      <Typography
                        variant="body2"
                        color={kpi.trend === 'up' ? 'success.main' : kpi.trend === 'down' ? 'error.main' : 'text.secondary'}
                      >
                        {kpi.change > 0 ? '+' : ''}{kpi.change}% vs período anterior
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: `${kpi.color}20`,
                      color: kpi.color,
                    }}
                  >
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </NordiaCard>
          </AnimatedWrapper>
        </Grid>
      ))}
    </Grid>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <Box>
        <GradientText variant="h4" gutterBottom>
          Analytics Dashboard
        </GradientText>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Alert severity="error">
        Error cargando datos de analytics. Intenta nuevamente.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <GradientText variant="h4" gutterBottom>
            Analytics Dashboard
          </GradientText>
          <Box display="flex" alignItems="center" gap={1}>
            <Psychology sx={{ color: colors.primary[500] }} />
            <Typography variant="body1" color="text.secondary">
              Red Neural Comercial - Insights en tiempo real
            </Typography>
            {!isOnline && (
              <Chip label="Modo Offline" color="warning" size="small" />
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              label="Período"
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="24h">Últimas 24h</MenuItem>
              <MenuItem value="7d">Últimos 7 días</MenuItem>
              <MenuItem value="30d">Últimos 30 días</MenuItem>
              <MenuItem value="90d">Últimos 90 días</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="sales">Ventas</ToggleButton>
            <ToggleButton value="revenue">Ingresos</ToggleButton>
            <ToggleButton value="neural">Neural</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Box mb={4}>
        {renderKPICards()}
      </Box>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Main sales/revenue chart */}
        <Grid item xs={12} lg={8}>
          <NordiaCard>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <TrendingUp sx={{ mr: 1, color: colors.primary[500] }} />
                {viewMode === 'sales' ? 'Ventas' : viewMode === 'revenue' ? 'Ingresos' : 'Predicciones Neurales'} - {timeRange}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                {viewMode === 'neural' ? (
                  <LineChart data={analyticsData.hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
                    <XAxis dataKey="hour" stroke={colors.gray[400]} />
                    <YAxis stroke={colors.gray[400]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.neural.surface,
                        border: `1px solid ${colors.neural.border}`,
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke={colors.primary[500]}
                      strokeWidth={3}
                      name="Ventas Reales"
                      dot={{ fill: colors.primary[500], r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="neural_prediction"
                      stroke={colors.secondary[500]}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicción Neural"
                      dot={{ fill: colors.secondary[500], r: 3 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={analyticsData.sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
                    <XAxis dataKey="date" stroke={colors.gray[400]} />
                    <YAxis stroke={colors.gray[400]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={viewMode === 'sales' ? 'sales' : 'revenue'}
                      stroke={colors.primary[500]}
                      fill={`url(#gradient-${viewMode})`}
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id={`gradient-${viewMode}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary[500]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.primary[500]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Category breakdown */}
        <Grid item xs={12} lg={4}>
          <NordiaCard>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <LocalFireDepartment sx={{ mr: 1, color: colors.warning }} />
                Categorías más vendidas
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="sales"
                  >
                    {analyticsData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} ventas`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Category legend */}
              <Box mt={2}>
                {analyticsData.categories.map((cat, index) => (
                  <Box key={cat.category} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center">
                      <Box
                        width={12}
                        height={12}
                        borderRadius="50%"
                        bgcolor={chartColors[index % chartColors.length]}
                        mr={1}
                      />
                      <Typography variant="body2">{cat.category}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {cat.sales}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Hourly pattern */}
        <Grid item xs={12}>
          <NordiaCard>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Schedule sx={{ mr: 1, color: colors.info }} />
                Patrón de ventas por hora
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
                  <XAxis dataKey="hour" stroke={colors.gray[400]} />
                  <YAxis stroke={colors.gray[400]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="sales" fill={colors.primary[500]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </NordiaCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
