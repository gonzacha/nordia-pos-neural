// components/Mobile/MobileNavigation.tsx - NAVEGACIÓN MÓVIL PROFESIONAL
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Fab,
  Badge,
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home,
  Scanner,
  Analytics,
  Settings,
  ShoppingCart,
  QrCodeScanner,
  Psychology,
  Inventory,
  Receipt,
  BarChart,
  TouchApp,
} from '@mui/icons-material';

interface MobileNavigationProps {
  hidden?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ hidden = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Navigation items
  const navItems = [
    { label: 'Inicio', icon: <Home />, path: '/', badge: 0 },
    { label: 'Scanner', icon: <QrCodeScanner />, path: '/scanner', badge: 0 },
    { label: 'POS', icon: <ShoppingCart />, path: '/pos', badge: 3 },
    { label: 'Analytics', icon: <Analytics />, path: '/analytics', badge: 0 },
  ];

  // Speed dial actions
  const speedDialActions = [
    {
      icon: <TouchApp />,
      name: 'Escanear Rápido',
      action: () => navigate('/discrete'),
      color: theme.palette.success.main,
    },
    {
      icon: <Psychology />,
      name: 'Neural Mode',
      action: () => navigate('/pwa'),
      color: theme.palette.primary.main,
    },
    {
      icon: <Inventory />,
      name: 'Inventario',
      action: () => console.log('Inventario'),
      color: theme.palette.warning.main,
    },
    {
      icon: <Receipt />,
      name: 'Reportes',
      action: () => console.log('Reportes'),
      color: theme.palette.info.main,
    },
  ];

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 50;

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setIsVisible(!scrollingDown || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Set initial navigation value based on current path
  useEffect(() => {
    const currentIndex = navItems.findIndex(item =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path))
    );
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location.pathname]);

  const handleNavigation = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const selectedItem = navItems[newValue];
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  if (hidden) return null;

  return (
    <>
      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Actions"
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          zIndex: 1300,
          '& .MuiFab-primary': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          },
        }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
        direction="up"
        FabProps={{
          size: 'medium',
          sx: {
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
          }
        }}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipPlacement="left"
            onClick={() => {
              action.action();
              setSpeedDialOpen(false);
            }}
            sx={{
              '& .MuiFab-root': {
                backgroundColor: action.color,
                color: 'white',
                '&:hover': {
                  backgroundColor: action.color,
                  filter: 'brightness(0.9)',
                },
              },
            }}
          />
        ))}
      </SpeedDial>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {(isVisible && !hidden) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1200,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                borderRadius: '24px 24px 0 0',
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  margin: '8px 0',
                },
              }}
            >
              <BottomNavigation
                value={value}
                onChange={handleNavigation}
                sx={{
                  background: 'transparent',
                  height: 70,
                  pt: 2,
                  '& .MuiBottomNavigationAction-root': {
                    minWidth: 'auto',
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                      '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      },
                    },
                    '&:not(.Mui-selected)': {
                      color: alpha(theme.palette.text.secondary, 0.7),
                    },
                  },
                }}
              >
                {navItems.map((item, index) => (
                  <BottomNavigationAction
                    key={item.label}
                    label={item.label}
                    value={index}
                    // onClick handled by BottomNavigation onChange
                    icon={
                      <motion.div
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {item.badge > 0 ? (
                          <Badge
                            badgeContent={item.badge}
                            color="error"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.625rem',
                                minWidth: 16,
                                height: 16,
                                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                                animation: value === index ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.1)' },
                                  '100%': { transform: 'scale(1)' },
                                },
                              },
                            }}
                          >
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </motion.div>
                    }
                    sx={{
                      position: 'relative',
                      '&.Mui-selected::before': {
                        content: '""',
                        position: 'absolute',
                        top: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 32,
                        height: 3,
                        borderRadius: 1.5,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      },
                    }}
                  />
                ))}
              </BottomNavigation>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for SpeedDial */}
      <Backdrop
        open={speedDialOpen}
        onClick={() => setSpeedDialOpen(false)}
        sx={{
          zIndex: 1250,
          backgroundColor: alpha(theme.palette.common.black, 0.3),
          backdropFilter: 'blur(4px)',
        }}
      />
    </>
  );
};

export default MobileNavigation;