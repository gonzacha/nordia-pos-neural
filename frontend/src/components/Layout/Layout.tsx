import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Dashboard, PointOfSale, QrCodeScanner, CameraAlt } from '@mui/icons-material';
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Nordia POS - Red Neural Comercial
          </Typography>

          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ mr: 1 }}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<PointOfSale />}
            onClick={() => navigate('/pos')}
            variant={location.pathname === '/pos' ? 'outlined' : 'text'}
            sx={{ mr: 1 }}
          >
            POS Clásico
          </Button>

          <Button
            color="inherit"
            startIcon={<QrCodeScanner />}
            onClick={() => navigate('/scanner')}
            variant={location.pathname === '/scanner' ? 'outlined' : 'text'}
            sx={{ mr: 1 }}
          >
            Scanner
          </Button>

          <Button
            color="inherit"
            startIcon={<CameraAlt />}
            onClick={() => navigate('/discrete')}
            variant={location.pathname === '/discrete' ? 'outlined' : 'text'}
          >
            Scanner Pro
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {location.pathname === '/pos' || location.pathname === '/scanner' || location.pathname === '/discrete' ? (
          children
        ) : (
          <Container maxWidth="xl" sx={{ py: 2 }}>
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
}