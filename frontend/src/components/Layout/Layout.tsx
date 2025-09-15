// components/Layout/Layout.tsx - RESPONSIVE Y OPTIMIZADO
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Badge,
  useMediaQuery,
  Container,
  Paper,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PointOfSale as PosIcon,
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  ShoppingCart as CartIcon,
  Psychology as NeuralIcon,
  Wifi as OnlineIcon,
  WifiOff as OfflineIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

// Context y UI components
import { useAppSelectors, useCartSelectors } from '../../context/AppContext';
// import { GradientText, GlassPanel } from '../UI/UIComponents';

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: DashboardIcon,
    description: 'Panel de control y analytics',
  },
  {
    path: '/pos',
    label: 'POS Clásico',
    icon: PosIcon,
    description: 'Punto de venta tradicional',
  },
  {
    path: '/scanner',
    label: 'Scanner',
    icon: ScannerIcon,
    description: 'Escaner de códigos rápido',
  },
  {
    path: '/discrete',
    label: 'Scanner Pro',
    icon: CameraIcon,
    description: 'Scanner discreto avanzado',
  },
];

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // App state
  const { isOnline, isLoading } = useAppSelectors();
  const { cartItemsCount, cartTotal } = useCartSelectors();

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Determinar si estamos en una vista POS (sin container)
  const isPOSView = ['/pos', '/scanner', '/discrete'].includes(location.pathname);

  const renderNavigationItems = () => (
    <List sx={{ pt: 0 }}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  minWidth: 40,
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={!isActive ? item.description : undefined}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: isActive ? 'text.primary' : 'text.secondary',
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const drawer = (
    <Box>
      {/* Header del drawer */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700
        }}>
          Nordia POS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Red Neural Comercial
        </Typography>
      </Box>

      {/* Estado de conexión */}
      <Box sx={{ p: 2 }}>
        <Chip
          icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
          label={isOnline ? 'En línea' : 'Sin conexión'}
          color={isOnline ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Navegación */}
      {renderNavigationItems()}

      {/* Carrito en el drawer (mobile) */}
      {isMobile && cartItemsCount > 0 && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Paper
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {cartItemsCount} productos
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              ${cartTotal.toLocaleString('es-AR')}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo y título */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <NeuralIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              Nordia POS
            </Typography>
            {!isMobile && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Red Neural Comercial
              </Typography>
            )}
          </Box>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <IconButton
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                      backgroundColor: isActive ? 'primary.50' : 'transparent',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: isActive ? 'primary.100' : 'action.hover',
                      },
                    }}
                  >
                    <Icon />
                  </IconButton>
                );
              })}
            </Box>
          )}

          {/* Carrito (desktop) */}
          {!isMobile && (
            <Badge badgeContent={cartItemsCount} color="primary" sx={{ ml: 2 }}>
              <IconButton
                sx={{
                  color: 'text.primary',
                  backgroundColor: 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <CartIcon />
              </IconButton>
            </Badge>
          )}

          {/* Indicador de conexión */}
          <IconButton
            size="small"
            sx={{
              ml: 1,
              color: isOnline ? 'success.main' : 'error.main',
            }}
          >
            {isOnline ? <OnlineIcon /> : <OfflineIcon />}
          </IconButton>

          {/* Loading indicator */}
          {isLoading && (
            <Box
              sx={{
                ml: 1,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent, #10b981)',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            },
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        
        {/* Content wrapper */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {isPOSView ? (
            // POS views sin container (fullscreen)
            children
          ) : (
            // Views normales con container
            <Container 
              maxWidth="xl" 
              sx={{ 
                py: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {children}
            </Container>
          )}
        </Box>
      </Box>
    </Box>
  );
}
