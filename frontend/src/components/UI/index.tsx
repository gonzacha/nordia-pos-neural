// components/UI/index.tsx - COMPONENTES BÁSICOS REUTILIZABLES
import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Card as MuiCard,
  CardProps as MuiCardProps,
  CircularProgress,
  Alert,
  Snackbar,
  SnackbarProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ===== BUTTON COMPONENTS =====

interface NordiaButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  gradient?: boolean;
}

const StyledButton = styled(MuiButton)<NordiaButtonProps>(({ theme }) => ({
  borderRadius: 12,
  padding: '10px 20px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

export const NordiaButton: React.FC<NordiaButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} /> : props.startIcon}
    >
      {children}
    </StyledButton>
  );
};

// ===== CARD COMPONENTS =====

interface NordiaCardProps extends MuiCardProps {
  hover?: boolean;
  gradient?: boolean;
}

const StyledCard = styled(MuiCard)<NordiaCardProps>(({ theme, hover }) => ({
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  transition: 'all 0.3s ease',
  ...(hover && {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  }),
}));

export const NordiaCard: React.FC<NordiaCardProps> = ({
  hover = false,
  children,
  ...props
}) => {
  return (
    <StyledCard hover={hover} {...props}>
      {children}
    </StyledCard>
  );
};

// ===== LOADING COMPONENTS =====

export const LoadingSkeleton: React.FC<{ height?: number; width?: string }> = ({
  height = 20,
  width = '100%',
}) => (
  <div
    style={{
      height,
      width,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
      borderRadius: 4,
    }}
  />
);

export const NordiaSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = '#10b981',
}) => (
  <CircularProgress size={size} sx={{ color }} />
);

// Export all components
export default {
  NordiaButton,
  NordiaCard,
  LoadingSkeleton,
  NordiaSpinner,
};