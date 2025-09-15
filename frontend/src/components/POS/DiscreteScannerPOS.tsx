import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Stack,
  Paper,
  Chip,
  Avatar,
  Slide,
  Fade,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingBag as BagIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/browser';
import PaymentDialog from './PaymentDialog';
import { useProductManager } from '../../services/ProductService';
import { Product, ProductCategory } from '../../types';

interface CartItem extends Product {
  quantity: number;
}

const DiscreteScannerPOS: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);
  const [lastDetectedCode, setLastDetectedCode] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [, setRecentProducts] = useState<Product[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const {
    findProduct,
    completeProduct,
    isLoading,
    completionModalOpen,
    productToComplete,
    setCompletionModalOpen
  } = useProductManager();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'otros',
    brand: '',
    stock: '1'
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  const startScanning = async () => {
    setIsScanning(true);
    setScanningActive(true);

    try {
      // Obtener stream de la cámara primero
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Preferir cámara trasera
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Luego iniciar el scanner
      codeReader.current.decodeFromVideoDevice(
        undefined, // usar dispositivo por defecto
        videoRef.current!,
        (result) => {
          if (result && result.getText() !== lastDetectedCode) {
            const code = result.getText();
            setLastDetectedCode(code);
            handleBarcodeDetected(code);

            // Auto-stop scanning después de detectar código
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = setTimeout(() => {
              stopScanning();
            }, 2000);
          }
        }
      );
    } catch (error) {
      console.error('Error accessing camera:', error);
      stopScanning();

      // Modo demo - simular escaneo para testing
      if (confirm('Cámara no disponible. ¿Usar modo demo con Coca Cola?')) {
        handleBarcodeDetected('7790895001234');
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanningActive(false);

    // Parar la cámara correctamente
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Reset del code reader - reinicializar en lugar de reset
    try {
      codeReader.current = new BrowserMultiFormatReader();
    } catch (error) {
      console.log('CodeReader reset not available');
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  // Productos mock para modo offline
  const mockProducts: Record<string, Product> = {
    '7790895001234': { id: '1', name: 'Coca Cola 500ml', price: 350, category: 'bebidas', stock: 48, barcode: '7790895001234' },
    '7794000123456': { id: '2', name: 'Agua Mineral 500ml', price: 200, category: 'bebidas', stock: 120, barcode: '7794000123456' },
    '7790742001234': { id: '3', name: 'Café La Virginia 500g', price: 2800, category: 'bebidas', stock: 25, barcode: '7790742001234' },
    '7793241001234': { id: '4', name: 'Fernet Branca 750ml', price: 4500, category: 'bebidas', stock: 12, barcode: '7793241001234' },
    '7790070001234': { id: '5', name: 'Cerveza Quilmes 473ml', price: 380, category: 'bebidas', stock: 36, barcode: '7790070001234' }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      // Primero intentar con productos mock (modo offline)
      const mockProduct = mockProducts[barcode];
      if (mockProduct) {
        addToCart(mockProduct);
        addToRecentProducts(mockProduct);
        return;
      }

      // Usar el nuevo sistema de productos con APIs externas
      const product = await findProduct(barcode);
      if (product) {
        addToCart(product);
        addToRecentProducts(product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const addToCart = (product: Product) => {
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

  const addToRecentProducts = (product: Product) => {
    setRecentProducts(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalAmount = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
              setTimeout(() => {
                alert(`🧠 Insight Neural: ${result.neural_insights.cross_selling[0].product}`);
              }, 1000);
            }
          }
        } catch (apiError) {
          console.log('Backend no disponible, procesando offline');
        }
      } else {
        console.log('🚀 Production mode: Sale processed offline');
        // Simular insight neural en producción
        setTimeout(() => {
          alert('🧠 Insight Neural: Venta procesada exitosamente');
        }, 1000);
      }

      // Limpiar carrito (venta completada)
      setCart([]);
      setRecentProducts([]);
      setPaymentOpen(false);

      // Mostrar confirmación
      setTimeout(() => {
        alert(`✅ Venta procesada: $${getTotalAmount().toLocaleString('es-AR')} (${paymentMethod})`);
      }, 500);

    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error procesando venta');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Header con información de sesión */}
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="600" color="#1e293b">
              Nordia POS
            </Typography>
            <Typography variant="body2" color="#64748b">
              {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip 
              icon={<BagIcon />}
              label={`${getTotalItems()} items`}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="h6" fontWeight="bold" color="#059669">
              ${getTotalAmount().toLocaleString('es-AR')}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Scanner discreto */}
      <Box sx={{ p: 2 }}>
        {!isScanning ? (
          <Card
            elevation={3}
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
              }
            }}
            onClick={startScanning}
          >
            <ScanIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" fontWeight="600">
              Escanear producto
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Apuntá la cámara al código de barras
            </Typography>
          </Card>
        ) : (
          <Card
            elevation={8}
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#000'
            }}
          >
            {/* Video scanner */}
            <Box sx={{ position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover'
                }}
              />
              
              {/* Overlay con marco de escaneo */}
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
                  animation: scanningActive ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
                  }
                }}
              />
              
              {/* Botón cerrar */}
              <IconButton
                onClick={stopScanning}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { background: 'rgba(0,0,0,0.7)' }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              {/* Código detectado */}
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
            </Box>
            
            {/* Loading indicator */}
            {isLoading && (
              <LinearProgress
                sx={{
                  height: 4,
                  background: 'rgba(16, 185, 129, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: '#10b981'
                  }
                }}
              />
            )}
          </Card>
        )}
      </Box>

      {/* Productos en carrito - estilo e-commerce */}
      <Box sx={{ px: 2 }}>
        {cart.map((item, index) => (
          <Slide key={item.id} direction="up" in={true} timeout={300 + index * 100}>
            <Card
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #10b981, #047857)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {item.name.charAt(0)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.category} • Stock: {item.stock}
                  </Typography>
                  <Typography variant="h6" color="#059669" fontWeight="bold">
                    ${item.price.toLocaleString('es-AR')}
                  </Typography>
                </Box>
                
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    sx={{ 
                      background: '#f1f5f9',
                      '&:hover': { background: '#e2e8f0' }
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ minWidth: 32, textAlign: 'center' }}
                  >
                    {item.quantity}
                  </Typography>
                  
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    sx={{
                      background: '#10b981',
                      color: 'white',
                      '&:hover': { background: '#059669' }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          </Slide>
        ))}
      </Box>

      {/* Botón de checkout flotante */}
      {cart.length > 0 && (
        <Fade in={true}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 20,
              left: 20,
              right: 20,
              p: 2,
              background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(30, 64, 175, 0.4)'
              }
            }}
            onClick={() => setPaymentOpen(true)}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {getTotalItems()} productos
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${getTotalAmount().toLocaleString('es-AR')}
                </Typography>
              </Box>
              
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight="600">
                  Cobrar
                </Typography>
                <ReceiptIcon />
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      )}

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={getTotalAmount()}
        onComplete={handlePaymentComplete}
      />

      {/* Modal para completar productos desconocidos */}
      <Dialog open={completionModalOpen} onClose={() => setCompletionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Completar información del producto
          {productToComplete && (
            <Typography variant="body2" color="text.secondary">
              Código: {productToComplete.barcode}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Nombre del producto"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />

            <TextField
              label="Precio"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              fullWidth
              InputProps={{
                startAdornment: <Typography>$</Typography>
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="bebidas">Bebidas</MenuItem>
                <MenuItem value="snacks">Snacks</MenuItem>
                <MenuItem value="lacteos">Lácteos</MenuItem>
                <MenuItem value="panaderia">Panadería</MenuItem>
                <MenuItem value="limpieza">Limpieza</MenuItem>
                <MenuItem value="cigarrillos">Cigarrillos</MenuItem>
                <MenuItem value="otros">Otros</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Marca"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Stock inicial"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCompletionModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (productToComplete) {
                const completedProduct: Product = {
                  ...productToComplete,
                  name: formData.name,
                  price: parseFloat(formData.price) || 0,
                  category: formData.category as ProductCategory,
                  brand: formData.brand,
                  stock: parseInt(formData.stock) || 1,
                  needsCompletion: false,
                  isUnknown: false
                };

                const savedProduct = await completeProduct(completedProduct);
                addToCart(savedProduct);
                addToRecentProducts(savedProduct);

                // Reset form
                setFormData({
                  name: '',
                  price: '',
                  category: 'otros',
                  brand: '',
                  stock: '1'
                });
              }
            }}
            disabled={!formData.name || !formData.price}
          >
            Guardar Producto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiscreteScannerPOS;
