import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Paper, List, ListItem, ListItemText, Divider,
  Badge, Chip, TextField
} from '@mui/material';
import { Add, Remove, ShoppingCart, Payment } from '@mui/icons-material';
import { useProducts } from '../../hooks/useProducts';
import PaymentDialog from './PaymentDialog';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function PosInterface() {
  const { products } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setPaymentOpen(true);
  };

  const handlePaymentComplete = async (paymentMethod: string) => {
    try {
      // Preparar datos de la venta
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        total: getTotal(),
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
            body: JSON.stringify(saleData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Venta registrada:', result);

            // Mostrar insights si los hay
            if (result.neural_insights && result.neural_insights.cross_selling.length > 0) {
              console.log('Sugerencias de cross-selling:', result.neural_insights.cross_selling);
            }
          } else {
            console.error('Error al registrar venta:', response.statusText);
          }
        } catch (error) {
          console.error('Error al conectar con el backend:', error);
        }
      } else {
        console.log('🚀 Production mode: Sale processed offline');
      }

      // Limpiar carrito siempre
      setCart([]);
      setPaymentOpen(false);
    } catch (error) {
      console.error('Error procesando venta:', error);
      // Continuar sin fallar para modo offline
      setCart([]);
      setPaymentOpen(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', p: 2, gap: 2 }}>
      {/* Panel de Productos */}
      <Box sx={{ flex: 2 }}>
        <Typography variant="h5" gutterBottom>
          Productos
        </Typography>
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => addToCart(product)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" noWrap>
                    {product.name}
                  </Typography>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{ my: 1 }}
                  />
                  <Typography variant="h5" color="primary">
                    ${product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock: {product.stock}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Panel del Carrito */}
      <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShoppingCart sx={{ mr: 1 }} />
          <Typography variant="h5">
            Carrito
          </Typography>
          <Badge badgeContent={cart.length} color="primary" sx={{ ml: 2 }}>
            <Box />
          </Badge>
        </Box>

        <List sx={{ flex: 1, overflow: 'auto' }}>
          {cart.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price} c/u`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Remove />
                  </Button>
                  <Typography>{item.quantity}</Typography>
                  <Button
                    size="small"
                    onClick={() => addToCart(item)}
                  >
                    <Add />
                  </Button>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {cart.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h4" textAlign="center" gutterBottom>
              Total: ${getTotal()}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Payment />}
              onClick={handleCheckout}
            >
              Procesar Pago
            </Button>
          </Box>
        )}
      </Paper>

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={getTotal()}
        onComplete={(paymentMethod) => handlePaymentComplete(paymentMethod)}
      />
    </Box>
  );
}