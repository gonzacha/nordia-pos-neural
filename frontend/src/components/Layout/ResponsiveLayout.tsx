// components/Layout/ResponsiveLayout.tsx - LAYOUT MOBILE-FIRST PROFESIONAL
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  useMediaQuery,
  useTheme,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu,
  Notifications,
  Psychology,
  Settings,
  Home,
  Scanner,
  Analytics,
  ShoppingCart,
  Close,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Components
import MobileNavigation from '../Mobile/MobileNavigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [scrolled, setScrolled] = useState(false);

  // Media queries
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Navigation items
  const navItems = [
    { label: 'Dashboard', icon: <Home />, path: '/' },
    { label: 'Scanner', icon: <Scanner />, path: '/scanner' },
    { label: 'POS', icon: <ShoppingCart />, path: '/pos' },
    { label: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { label: 'Configuración', icon: <Settings />, path: '/pwa' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop/Tablet Header
  const DesktopHeader = () => (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <AppBar
        position="fixed"
        elevation={scrolled ? 8 : 0}
        sx={{
          background: scrolled
            ? alpha(theme.palette.background.paper, 0.95)
            : 'transparent',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, scrolled ? 0.1 : 0)}`,
          color: theme.palette.text.primary,
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* Logo y Título */}
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  width: 40,
                  height: 40,
                }}
              >
                <Psychology />
              </Avatar>
            </motion.div>

            <Box>
              <Typography variant="h6" fontWeight="bold">
                Nordia POS Neural
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isDesktop ? 'Sistema Neural Avanzado' : 'Neural POS'}
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {isDesktop && (
            <Box display="flex" alignItems="center" gap={1}>
              {navItems.slice(0, 4).map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      mx: 0.5,
                      position: 'relative',
                      color: location.pathname === item.path
                        ? theme.palette.primary.main
                        : 'text.secondary',
                      '&::before': location.pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '50%',
                        height: 2,
                        borderRadius: 1,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      } : {},
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </motion.div>
              ))}
            </Box>
          )}

          {/* Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Notifications */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <IconButton>
                <Badge
                  badgeContent={notificationCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' },
                      },
                    },
                  }}
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </motion.div>

            {/* Menu (Mobile/Tablet) */}
            {!isDesktop && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <Menu />
                </IconButton>
              </motion.div>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );

  // Mobile Header
  const MobileHeader = () => (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          background: scrolled
            ? alpha(theme.palette.background.paper, 0.95)
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          backdropFilter: 'blur(15px)',
          color: theme.palette.text.primary,
          borderRadius: scrolled ? 0 : '0 0 24px 24px',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <motion.div
              whileTap={{ scale: 0.8, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  width: 36,
                  height: 36,
                }}
              >
                <Psychology sx={{ fontSize: 20 }} />
              </Avatar>
            </motion.div>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Neural POS
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Móvil Profesional
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <motion.div whileTap={{ scale: 0.8 }}>
              <IconButton size="small">
                <Badge badgeContent={notificationCount} color="error">
                  <Notifications sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </motion.div>

            <motion.div whileTap={{ scale: 0.8 }}>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  background: alpha(theme.palette.primary.main, 0.1),
                  ml: 1,
                }}
              >
                <Menu sx={{ fontSize: 20 }} />
              </IconButton>
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );

  // Side Drawer
  const DrawerContent = () => (
    <Box sx={{ width: 280, pt: 2 }}>
      {/* Header del Drawer */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
          <Typography variant="h6" fontWeight="bold">
            Nordia Neural
          </Typography>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: 'white', ml: 'auto' }}
          >
            <Close />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Sistema POS Inteligente
        </Typography>

        {/* Decoración de fondo */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
          }}
        />
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2 }}>
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <ListItem
              button
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                background: location.pathname === item.path
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path
                    ? theme.palette.primary.main
                    : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    color: location.pathname === item.path
                      ? theme.palette.primary.main
                      : 'text.primary',
                  },
                }}
              />
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Divider sx={{ my: 2, mx: 2 }} />

      {/* Configuraciones adicionales */}
      <List sx={{ px: 2 }}>
        <ListItem button sx={{ borderRadius: 2, mb: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Brightness4 />
          </ListItemIcon>
          <ListItemText primary="Tema Oscuro" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isMobile
          ? theme.palette.background.default
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.01)})`,
      }}
    >
      {/* Header responsivo */}
      {isMobile ? <MobileHeader /> : <DesktopHeader />}

      {/* Drawer para navegación */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: 'none',
          },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          pt: isMobile ? '80px' : '88px',
          pb: isMobile ? '80px' : 0,
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navegación móvil */}
      {isMobile && <MobileNavigation />}
    </Box>
  );
};

export default ResponsiveLayout;