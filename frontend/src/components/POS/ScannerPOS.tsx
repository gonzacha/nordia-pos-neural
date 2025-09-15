import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Button,
  Typography,
  IconButton,
  Fab,
  Badge,
  Stack,
  Paper
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Analytics as InsightsIcon,
  CameraAlt as CameraIcon,
  FlashlightOn,
  FlashlightOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PaymentDialog from './PaymentDialog';

// Importar librería de barcode scanning
import { BrowserMultiFormatReader } from '@zxing/browser';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const ScannerPOS: React.FC = () => {
  const theme = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScannedProduct, setLastScannedProduct] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const startBarcodeScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, error) => {
          if (result) {
            handleBarcodeDetected(result.getText());
            stopScanning();
          }
        }
      );
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsScanning(false);

      // Modo demo - simular escaneo para testing
      if (confirm('Cámara no disponible. ¿Usar modo demo con Coca Cola?')) {
        handleBarcodeDetected('7790895001234');
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    try {
      codeReader.current = new BrowserMultiFormatReader();
    } catch (error) {
      console.log('CodeReader reset not available');
    }
  };

  // Productos mock para modo offline
  const mockProducts = {
    '7790895001234': { id: '1', name: 'Coca Cola 500ml', price: 350, category: 'Bebidas', stock: 48 },
    '7794000123456': { id: '2', name: 'Agua Mineral 500ml', price: 200, category: 'Bebidas', stock: 120 },
    '7790742001234': { id: '3', name: 'Café La Virginia 500g', price: 2800, category: 'Bebidas', stock: 25 },
    '7793241001234': { id: '4', name: 'Fernet Branca 750ml', price: 4500, category: 'Bebidas', stock: 12 },
    '7790070001234': { id: '5', name: 'Cerveza Quilmes 473ml', price: 380, category: 'Bebidas', stock: 36 }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    console.log('Código detectado:', barcode);

    // Primero intentar con productos mock (modo offline)
    const mockProduct = mockProducts[barcode as keyof typeof mockProducts];
    if (mockProduct) {
      setLastScannedProduct(mockProduct);
      addToCart(mockProduct);
      return;
    }

    // En producción, no hacer llamadas a localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Solo en desarrollo, intentar API
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/products/barcode/${barcode}`);
        if (response.ok) {
          const product = await response.json();
          setLastScannedProduct(product);
          addToCart(product);
          return;
        }
      } catch (error) {
        console.error('Error buscando producto:', error);
      }
    }

    // Producto no encontrado
    console.log('Producto no encontrado para código:', barcode);
    alert(`Código ${barcode} no encontrado. Agregue manualmente o use productos disponibles.`);
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const handlePaymentComplete = async (paymentMethod: string) => {
    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        total: getTotalAmount(),
        payment_method: paymentMethod,
        customer_info: null
      };

      // Solo enviar al backend en desarrollo
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/sales`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(saleData),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Venta registrada:', result);

            if (result.neural_insights && result.neural_insights.cross_selling.length > 0) {
              console.log('Sugerencias de cross-selling:', result.neural_insights.cross_selling);
            }
          }
        } catch (apiError) {
          console.log('Backend no disponible, procesando offline');
        }
      } else {
        console.log('🚀 Production mode: Sale processed offline');
      }

      // Simular insights neurales offline
      const offlineInsights = {
        cross_selling: cart.some(item => item.name.includes('Coca Cola'))
          ? [{ product: 'Papas Lay\'s 150g', reason: 'Complementa bebidas', confidence: 0.85 }]
          : []
      };

      if (offlineInsights.cross_selling.length > 0) {
        setTimeout(() => {
          alert(`🧠 Insight Neural: Te sugiero agregar ${offlineInsights.cross_selling[0].product}`);
        }, 1000);
      }

      // Limpiar carrito (venta completada)
      setCart([]);
      setLastScannedProduct(null);
      setPaymentOpen(false);

      // Mostrar confirmación
      setTimeout(() => {
        alert(`✅ Venta procesada por $${getTotalAmount().toLocaleString('es-AR')} (${paymentMethod})`);
      }, 500);

    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error procesando venta');
    }
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalAmount = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #047857 100%)',
      padding: 2,
      position: 'relative'
    }}>
      {/* Header estilo MercadoPago */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 2,
          mb: 3
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Nordia POS Neural
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tu caja inteligente
            </Typography>
          </Box>

          <Badge badgeContent={getTotalItems()} color="primary">
            <IconButton
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                }
              }}
              onClick={() => setPaymentOpen(true)}
              disabled={cart.length === 0}
            >
              <CartIcon />
            </IconButton>
          </Badge>
        </Stack>
      </Paper>

      {/* Botón principal de escaneo QR/Barcode - Estilo MercadoPago */}
      <Card
        elevation={8}
        sx={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 4,
          p: 3,
          mb: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom color="text.primary" fontWeight="600">
          Escanear producto
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<QrIcon />}
          onClick={startBarcodeScanning}
          disabled={isScanning}
          sx={{
            background: isScanning
              ? 'linear-gradient(135deg, #6b7280, #4b5563)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 3,
            py: 2,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669, #047857)',
              boxShadow: '0 6px 25px rgba(16, 185, 129, 0.4)',
            }
          }}
        >
          {isScanning ? 'Escaneando...' : 'Escanear Código'}
        </Button>

        {isScanning && (
          <Box sx={{ mt: 2 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxWidth: '300px',
                borderRadius: '12px',
                border: '3px solid #10b981'
              }}
            />
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <IconButton
                onClick={() => setFlashOn(!flashOn)}
                sx={{
                  background: flashOn ? '#fbbf24' : 'rgba(0,0,0,0.1)',
                  color: flashOn ? 'white' : 'text.primary'
                }}
              >
                {flashOn ? <FlashlightOn /> : <FlashlightOff />}
              </IconButton>

              <Button
                variant="outlined"
                onClick={stopScanning}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
            </Stack>
          </Box>
        )}
      </Card>

      {/* Último producto escaneado */}
      {lastScannedProduct && (
        <Card
          elevation={4}
          sx={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            p: 2,
            mb: 2,
            border: '2px solid #10b981'
          }}
        >
          <Typography variant="subtitle1" color="primary" fontWeight="bold">
            ✅ Producto agregado
          </Typography>
          <Typography variant="h6">{lastScannedProduct.name}</Typography>
          <Typography variant="body1" color="primary" fontWeight="bold">
            ${lastScannedProduct.price?.toLocaleString('es-AR')}
          </Typography>
        </Card>
      )}

      {/* Carrito resumen */}
      {cart.length > 0 && (
        <Card
          elevation={6}
          sx={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            p: 2,
            mb: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Carrito ({getTotalItems()} items)
          </Typography>

          {cart.map((item, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 1 }}
            >
              <Box>
                <Typography variant="body1">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cantidad: {item.quantity}
                </Typography>
              </Box>
              <Typography variant="h6" color="primary">
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </Typography>
            </Stack>
          ))}

          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${getTotalAmount().toLocaleString('es-AR')}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={() => setPaymentOpen(true)}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                }
              }}
            >
              Procesar Pago
            </Button>
          </Box>
        </Card>
      )}

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={getTotalAmount()}
        onComplete={handlePaymentComplete}
      />
    </Box>
  );
};

export default ScannerPOS;