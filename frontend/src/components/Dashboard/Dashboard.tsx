import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { TrendingUp, ShoppingCart, Psychology } from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface DayAnalytics {
  total_revenue: number;
  total_transactions: number;
  average_ticket: number;
  neural_status: string;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<DayAnalytics>({
    total_revenue: 0,
    total_transactions: 0,
    average_ticket: 0,
    neural_status: 'active'
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/sales/analytics/today`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Control - Red Neural Comercial
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Ventas del Día</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ${analytics.total_revenue.toLocaleString('es-AR')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ticket promedio: ${analytics.average_ticket.toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Transacciones</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {analytics.total_transactions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas procesadas hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Psychology sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Red Neural</Typography>
              </Box>
              <Chip
                label={analytics.neural_status === 'active' ? 'Activa' : 'Inactiva'}
                color={analytics.neural_status === 'active' ? 'success' : 'error'}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Generando insights en tiempo real
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Próximas Funcionalidades
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    ✅ POS Funcional con productos reales
                  </Typography>
                  <Typography variant="body1">
                    ✅ Procesamiento de pagos múltiples
                  </Typography>
                  <Typography variant="body1">
                    ✅ Motor neural con insights automáticos
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    🔄 WhatsApp Business API (próximamente)
                  </Typography>
                  <Typography variant="body1">
                    🔄 MercadoPago Integration (próximamente)
                  </Typography>
                  <Typography variant="body1">
                    🔄 Gestión de inventario avanzada
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}