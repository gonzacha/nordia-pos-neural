import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, ButtonGroup, Chip,
  TextField, Divider
} from '@mui/material';
import { CreditCard, Money, Smartphone, Check } from '@mui/icons-material';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onComplete: (paymentMethod: string) => void;
}

export default function PaymentDialog({ open, onClose, amount, onComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    setProcessing(false);
    onComplete(paymentMethod);

    // Reset
    setCashReceived('');
    setPaymentMethod('cash');
  };

  const getChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Procesar Pago
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" color="primary" gutterBottom>
            ${amount.toFixed(2)}
          </Typography>
          <Chip label="Total a cobrar" color="primary" variant="outlined" />
        </Box>

        <Typography variant="h6" gutterBottom>
          Método de Pago
        </Typography>
        <ButtonGroup fullWidth sx={{ mb: 3 }}>
          <Button
            variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
            startIcon={<Money />}
            onClick={() => setPaymentMethod('cash')}
          >
            Efectivo
          </Button>
          <Button
            variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
            startIcon={<CreditCard />}
            onClick={() => setPaymentMethod('card')}
          >
            Tarjeta
          </Button>
          <Button
            variant={paymentMethod === 'transfer' ? 'contained' : 'outlined'}
            startIcon={<Smartphone />}
            onClick={() => setPaymentMethod('transfer')}
          >
            Transferencia
          </Button>
        </ButtonGroup>

        {paymentMethod === 'cash' && (
          <Box>
            <TextField
              fullWidth
              label="Efectivo recibido"
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              sx={{ mb: 2 }}
            />
            {cashReceived && (
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6">
                  Vuelto: ${getChange().toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {paymentMethod === 'card' && (
          <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <CreditCard sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography>Acerque o inserte la tarjeta</Typography>
          </Box>
        )}

        {paymentMethod === 'transfer' && (
          <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Smartphone sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography>Esperando transferencia...</Typography>
            <Typography variant="body2" color="text.secondary">
              CBU: 0000003100000123456789
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={processing}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={
            processing ||
            (paymentMethod === 'cash' && (parseFloat(cashReceived) || 0) < amount)
          }
          startIcon={processing ? undefined : <Check />}
          sx={{ minWidth: 120 }}
        >
          {processing ? 'Procesando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}