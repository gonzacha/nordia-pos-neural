// components/PWA/PWAManager.tsx - GESTOR PWA SIMPLIFICADO
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CloudSync as SyncIcon,
  Storage as StorageIcon,
  Wifi as OnlineIcon,
  WifiOff as OfflineIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import { NordiaCard, NordiaButton } from '../UI';
import { useAppSelectors } from '../../context/AppContext';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAManager: React.FC = () => {
  const { isOnline } = useAppSelectors();

  // PWA Install
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);

  // Storage
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);

  useEffect(() => {
    // Check if PWA is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    // Check notifications support
    const checkNotifications = async () => {
      if ('Notification' in window) {
        setNotificationsSupported(true);
        setNotificationsEnabled(Notification.permission === 'granted');
      }
    };

    // Check storage
    const checkStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageUsed(estimate.usage || 0);
          setStorageQuota(estimate.quota || 0);
        } catch (error) {
          console.log('Storage estimate not available');
        }
      }
    };

    checkInstalled();
    checkNotifications();
    checkStorage();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error('PWA install error:', error);
    }
  };

  const handleNotificationToggle = async () => {
    if (!notificationsSupported) return;

    if (!notificationsEnabled) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    } else {
      // Note: Can't revoke notifications programmatically
      alert('Para desactivar notificaciones, ve a la configuración del navegador');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
          📱 PWA Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control avanzado de funciones offline y PWA
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Connection Status */}
        <Grid item xs={12} md={4}>
          <NordiaCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {isOnline ? (
                  <OnlineIcon sx={{ color: '#10b981', mr: 1 }} />
                ) : (
                  <OfflineIcon sx={{ color: '#ef4444', mr: 1 }} />
                )}
                <Typography variant="h6" fontWeight="600">
                  Conexión
                </Typography>
              </Box>

              <Chip
                label={isOnline ? 'En línea' : 'Offline'}
                color={isOnline ? 'success' : 'error'}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                {isOnline
                  ? 'Conectado a internet. Sincronización automática activada.'
                  : 'Modo offline. Los datos se sincronizarán cuando se recupere la conexión.'
                }
              </Typography>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* PWA Installation */}
        <Grid item xs={12} md={4}>
          <NordiaCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DownloadIcon sx={{ color: '#3b82f6', mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Instalación
                </Typography>
              </Box>

              {isInstalled ? (
                <>
                  <Chip label="App instalada" color="success" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    La aplicación está instalada como PWA y puede usarse offline.
                  </Typography>
                </>
              ) : (
                <>
                  <NordiaButton
                    variant="primary"
                    onClick={handleInstallPWA}
                    disabled={!installPrompt}
                    startIcon={<DownloadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Instalar App
                  </NordiaButton>
                  <Typography variant="body2" color="text.secondary">
                    {installPrompt
                      ? 'Instala la app para acceso rápido y funciones offline.'
                      : 'Instalación no disponible en este navegador.'
                    }
                  </Typography>
                </>
              )}
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <NordiaCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ color: '#f59e0b', mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Notificaciones
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={handleNotificationToggle}
                    disabled={!notificationsSupported}
                  />
                }
                label="Activar notificaciones"
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                {notificationsSupported
                  ? notificationsEnabled
                    ? 'Recibirás alertas de ventas, stock bajo y insights neurales.'
                    : 'Activa las notificaciones para recibir alertas importantes.'
                  : 'Notificaciones no soportadas en este navegador.'
                }
              </Typography>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Storage */}
        <Grid item xs={12} md={6}>
          <NordiaCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Almacenamiento
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Usado: {formatBytes(storageUsed)} de {formatBytes(storageQuota)} ({storagePercentage.toFixed(1)}%)
                </Typography>

                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    backgroundColor: '#e2e8f0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.min(storagePercentage, 100)}%`,
                      height: '100%',
                      backgroundColor: storagePercentage > 80 ? '#ef4444' : '#10b981',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>

              <Alert severity={storagePercentage > 80 ? 'warning' : 'info'}>
                {storagePercentage > 80
                  ? 'Almacenamiento casi lleno. Considera limpiar datos antiguos.'
                  : 'Almacenamiento disponible para datos offline.'
                }
              </Alert>
            </CardContent>
          </NordiaCard>
        </Grid>

        {/* Sync Status */}
        <Grid item xs={12} md={6}>
          <NordiaCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SyncIcon sx={{ color: '#10b981', mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Sincronización
                </Typography>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Productos"
                    secondary="Última sync: hace 2 min"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon sx={{ color: '#3b82f6' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ventas"
                    secondary="Pendientes: 0"
                  />
                </ListItem>
              </List>

              {!isOnline && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Modo offline: Los datos se sincronizarán automáticamente cuando se recupere la conexión.
                </Alert>
              )}
            </CardContent>
          </NordiaCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PWAManager;