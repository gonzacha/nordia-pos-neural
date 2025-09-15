// components/Scanner/BarcodeScanner.tsx - NUEVO COMPONENTE UNIFICADO
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  Close as CloseIcon,
  FlashlightOn,
  FlashlightOff,
  CameraAlt,
  Refresh,
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/browser';

export interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  isOpen: boolean;
  autoStop?: boolean;
  enableSound?: boolean;
  enableVibration?: boolean;
  timeout?: number;
  style?: 'discrete' | 'fullscreen' | 'compact';
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  onClose,
  isOpen,
  autoStop = true,
  enableSound = true,
  enableVibration = true,
  timeout = 30000, // 30 segundos
  style = 'discrete'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDetectedCode, setLastDetectedCode] = useState<string>('');
  const [scanCount, setScanCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (codeReaderRef.current) {
      try {
        // Reset not available in newer versions, reinitialize instead
        codeReaderRef.current = new BrowserMultiFormatReader();
      } catch (e) {
        console.log('CodeReader reset not available');
      }
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsScanning(false);
    setError(null);
  }, []);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setError(null);
    setScanCount(prev => prev + 1);

    try {
      // Initialize code reader
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start decoding
      codeReaderRef.current.decodeFromVideoDevice(
        undefined, // Use default device
        videoRef.current!,
        (result: any, error?: Error) => {
          if (result) {
            const code = result.getText();
            
            // Avoid duplicate scans
            if (code !== lastDetectedCode) {
              setLastDetectedCode(code);
              handleScanSuccess(code);
            }
          }
          
          if (error && !(error.name === 'NotFoundException')) {
            console.warn('Scan error:', error);
          }
        }
      );

      // Set timeout
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          setError('Tiempo de escaneo agotado');
          stopScanning();
        }, timeout);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('Permission denied')) {
        setError('Acceso a la cámara denegado. Por favor, permite el acceso.');
      } else if (errorMessage.includes('not found')) {
        setError('No se encontró cámara disponible.');
      } else {
        setError(`Error al acceder a la cámara: ${errorMessage}`);
      }
      
      onError?.(errorMessage);
      setIsScanning(false);
    }
  }, [isScanning, lastDetectedCode, timeout, onError]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    cleanup();
    onClose?.();
  }, [cleanup, onClose]);

  // Handle successful scan
  const handleScanSuccess = useCallback((code: string) => {
    console.log('✅ Código escaneado:', code);

    // Haptic feedback
    if (enableVibration && navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Audio feedback
    if (enableSound) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        console.log('Audio feedback not available');
      }
    }

    onScan(code);

    if (autoStop) {
      setTimeout(() => stopScanning(), 1500);
    }
  }, [onScan, autoStop, enableSound, enableVibration, stopScanning]);

  // Toggle flash (if supported)
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if ((capabilities as any).torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn } as any]
        });
        setFlashOn(!flashOn);
      }
    } catch (e) {
      console.log('Flash not supported');
    }
  }, [flashOn]);

  // Effects
  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    } else if (!isOpen && isScanning) {
      stopScanning();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, startScanning, stopScanning, cleanup, isScanning]);

  // Don't render if not open
  if (!isOpen) return null;

  // Render based on style
  const renderScanner = () => {
    const commonVideoProps = {
      ref: videoRef,
      autoPlay: true,
      playsInline: true,
      muted: true,
      style: { width: '100%', height: '100%', objectFit: 'cover' as const }
    };

    const commonOverlay = (
      <>
        {/* Scanning frame */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '60px',
            border: '3px solid #10b981',
            borderRadius: 2,
            background: 'rgba(16, 185, 129, 0.1)',
            animation: isScanning ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
              '70%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
            }
          }}
        />

        {/* Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1
          }}
        >
          <IconButton
            onClick={toggleFlash}
            sx={{
              background: 'rgba(0,0,0,0.5)',
              color: flashOn ? '#fbbf24' : 'white',
              '&:hover': { background: 'rgba(0,0,0,0.7)' }
            }}
          >
            {flashOn ? <FlashlightOn /> : <FlashlightOff />}
          </IconButton>

          <IconButton
            onClick={stopScanning}
            sx={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { background: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Status indicators */}
        {lastDetectedCode && (
          <Chip
            label={`Código: ${lastDetectedCode}`}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              background: '#10b981',
              color: 'white',
              fontWeight: 600
            }}
          />
        )}

        {isScanning && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(0,0,0,0.5)',
              padding: '8px 12px',
              borderRadius: 2
            }}
          >
            <CircularProgress size={20} sx={{ color: '#10b981' }} />
            <Typography variant="body2" sx={{ color: 'white' }}>
              Escaneando...
            </Typography>
          </Box>
        )}
      </>
    );

    if (style === 'fullscreen') {
      return (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: '#000'
          }}
        >
          <video {...commonVideoProps} />
          {commonOverlay}
        </Box>
      );
    }

    if (style === 'compact') {
      return (
        <Card
          elevation={4}
          sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            background: '#000',
            maxWidth: 300,
            margin: '0 auto'
          }}
        >
          <Box sx={{ position: 'relative', height: 200 }}>
            <video {...commonVideoProps} />
            {commonOverlay}
          </Box>
        </Card>
      );
    }

    // Default: discrete style
    return (
      <Card
        elevation={8}
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          background: '#000'
        }}
      >
        <Box sx={{ position: 'relative', height: 300 }}>
          <video {...commonVideoProps} />
          {commonOverlay}
        </Box>
      </Card>
    );
  };

  return (
    <Fade in={isOpen}>
      <Box>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={startScanning} startIcon={<Refresh />}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {renderScanner()}
        
        {scanCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Intentos de escaneo: {scanCount}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default BarcodeScanner;
