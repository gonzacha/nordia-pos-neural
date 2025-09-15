// components/Mobile/MobileCharts.tsx - GRÁFICOS TÁCTILES OPTIMIZADOS
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
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
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  Timeline,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  SwipeLeft,
  SwipeRight,
} from '@mui/icons-material';

// Tipos
interface ChartData {
  name: string;
  value: number;
  sales?: number;
  revenue?: number;
  growth?: number;
}

interface MobileChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie';
  color?: string;
  height?: number;
}

// Tooltip personalizado para móvil
const MobileTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Card
        sx={{
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderRadius: 2,
          p: 1,
          minWidth: 120,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={index} display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <Typography variant="body2" fontWeight="medium">
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Card>
    );
  }
  return null;
};

// Componente de gráfico móvil individual
const MobileChart: React.FC<MobileChartProps> = ({
  title,
  data,
  type,
  color = '#10b981',
  height = 200,
}) => {
  const theme = useTheme();

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(color, 0.1)} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            />
            <YAxis hide />
            <Tooltip content={<MobileTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(color, 0.1)} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            />
            <YAxis hide />
            <Tooltip content={<MobileTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color.replace('#', '')})`}
            />
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(color, 0.1)} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            />
            <YAxis hide />
            <Tooltip content={<MobileTooltip />} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        const COLORS = [color, alpha(color, 0.7), alpha(color, 0.5), alpha(color, 0.3)];
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<MobileTooltip />} />
          </PieChart>
        );

      default:
        return <div>Chart not supported</div>;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        sx={{
          background: alpha(color, 0.05),
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              {title}
            </Typography>
            <Chip
              size="small"
              label="Live"
              sx={{
                background: alpha(color, 0.2),
                color: color,
                fontWeight: 'bold',
                fontSize: '0.6rem',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 },
                },
              }}
            />
          </Box>

          <Box sx={{ height, width: '100%', touchAction: 'pan-y' }}>
            <ResponsiveContainer>
              {renderChart()}
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Contenedor principal de gráficos móviles
const MobileChartsContainer: React.FC = () => {
  const theme = useTheme();
  const [activeChart, setActiveChart] = useState(0);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('area');

  // Datos de ejemplo
  const chartData = {
    ventas: [
      { name: 'Lun', value: 120, sales: 45, revenue: 2400 },
      { name: 'Mar', value: 190, sales: 67, revenue: 3200 },
      { name: 'Mié', value: 150, sales: 52, revenue: 2800 },
      { name: 'Jue', value: 220, sales: 78, revenue: 3800 },
      { name: 'Vie', value: 280, sales: 95, revenue: 4200 },
      { name: 'Sáb', value: 350, sales: 125, revenue: 5100 },
      { name: 'Dom', value: 180, sales: 62, revenue: 3100 },
    ],
    productos: [
      { name: 'Lácteos', value: 35 },
      { name: 'Bebidas', value: 25 },
      { name: 'Snacks', value: 20 },
      { name: 'Otros', value: 20 },
    ],
    horarios: [
      { name: '9-11', value: 45 },
      { name: '11-13', value: 78 },
      { name: '13-15', value: 125 },
      { name: '15-17', value: 95 },
      { name: '17-19', value: 165 },
      { name: '19-21', value: 85 },
    ],
  };

  const charts = [
    { title: 'Ventas Semanales', data: chartData.ventas, color: '#10b981' },
    { title: 'Productos Top', data: chartData.productos, color: '#f59e0b' },
    { title: 'Tráfico por Horario', data: chartData.horarios, color: '#8b5cf6' },
  ];

  // Gestos swipe
  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveChart(prev => (prev + 1) % charts.length),
    onSwipedRight: () => setActiveChart(prev => (prev - 1 + charts.length) % charts.length),
    trackMouse: true,
  });

  const chartTypes = [
    { type: 'area' as const, icon: <Timeline />, label: 'Área' },
    { type: 'line' as const, icon: <TrendingUp />, label: 'Línea' },
    { type: 'bar' as const, icon: <BarChartIcon />, label: 'Barras' },
    { type: 'pie' as const, icon: <PieChartIcon />, label: 'Circular' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          📊 Gráficos Táctiles
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" onClick={() => setActiveChart(prev => (prev - 1 + charts.length) % charts.length)}>
            <SwipeRight />
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {activeChart + 1}/{charts.length}
          </Typography>
          <IconButton size="small" onClick={() => setActiveChart(prev => (prev + 1) % charts.length)}>
            <SwipeLeft />
          </IconButton>
        </Box>
      </Box>

      {/* Selector de tipo de gráfico */}
      <ButtonGroup
        size="small"
        variant="outlined"
        sx={{ mb: 2, width: '100%' }}
      >
        {chartTypes.map((type) => (
          <Button
            key={type.type}
            onClick={() => setChartType(type.type)}
            variant={chartType === type.type ? 'contained' : 'outlined'}
            sx={{
              flex: 1,
              minWidth: 'auto',
              px: 1,
              '&.MuiButton-contained': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            {type.icon}
          </Button>
        ))}
      </ButtonGroup>

      {/* Gráfico actual */}
      <motion.div
        {...handlers}
        key={activeChart}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <MobileChart
          title={charts[activeChart].title}
          data={charts[activeChart].data}
          type={chartType}
          color={charts[activeChart].color}
          height={250}
        />
      </motion.div>

      {/* Indicadores */}
      <Box display="flex" justifyContent="center" gap={1} mt={2}>
        {charts.map((_, index) => (
          <motion.div
            key={index}
            whileTap={{ scale: 0.8 }}
            onClick={() => setActiveChart(index)}
          >
            <Box
              sx={{
                width: activeChart === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: activeChart === index
                  ? charts[index].color
                  : alpha(charts[index].color, 0.3),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          </motion.div>
        ))}
      </Box>

      {/* Hint de gestos */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          background: alpha(theme.palette.info.main, 0.1),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="info.main">
          👈👉 Desliza para cambiar • 👆 Toca para seleccionar
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileChartsContainer;