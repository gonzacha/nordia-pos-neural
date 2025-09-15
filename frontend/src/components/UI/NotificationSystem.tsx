// components/UI/NotificationSystem.tsx - SISTEMA DE NOTIFICACIONES
import React from 'react';
import { Snackbar, Alert, Slide, SlideProps } from '@mui/material';
import { useAppContext, useAppActions, useAppSelectors } from '../../context/AppContext';

// Componente de transición personalizado
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const NotificationSystem: React.FC = () => {
  const { error, successMessage } = useAppSelectors();
  const { setError, setSuccess } = useAppActions();

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <>
      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
        sx={{ mb: 2 }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            minWidth: 300,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
        sx={{ mb: 2 }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            minWidth: 300,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationSystem;
