// theme/nordiaTheme.ts - TEMA PERSONALIZADO NORDIA
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Colores de marca Nordia
const nordiaColors = {
  // Primarios - Verde neural
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981', // Color principal Nordia
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Secundarios - Azul tecnológico
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Grises neuronales
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Alertas y estados
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Fondos oscuros para modo neural
  neural: {
    background: '#0b0f10',
    surface: '#10161a',
    soft: '#0f1417',
    border: '#1f2a2f',
  }
};

// Tipografía mejorada
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'Ubuntu',
    'Cantarell',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none' as const,
  },
};

// Componentes personalizados
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: '10px 20px',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none' as const,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        },
      },
      contained: {
        background: `linear-gradient(135deg, ${nordiaColors.primary[500]}, ${nordiaColors.primary[600]})`,
        '&:hover': {
          background: `linear-gradient(135deg, ${nordiaColors.primary[600]}, ${nordiaColors.primary[700]})`,
        },
      },
      outlined: {
        borderColor: nordiaColors.primary[300],
        color: nordiaColors.primary[600],
        '&:hover': {
          borderColor: nordiaColors.primary[500],
          backgroundColor: alpha(nordiaColors.primary[500], 0.04),
        },
      },
    },
  },
  
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${nordiaColors.gray[200]}`,
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      elevation2: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
      filled: {
        backgroundColor: alpha(nordiaColors.primary[500], 0.1),
        color: nordiaColors.primary[700],
        '&:hover': {
          backgroundColor: alpha(nordiaColors.primary[500], 0.2),
        },
      },
    },
  },
  
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          '& fieldset': {
            borderColor: nordiaColors.gray[300],
          },
          '&:hover fieldset': {
            borderColor: nordiaColors.primary[400],
          },
          '&.Mui-focused fieldset': {
            borderColor: nordiaColors.primary[500],
          },
        },
      },
    },
  },
  
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${nordiaColors.gray[200]}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        '&:hover': {
          backgroundColor: alpha(nordiaColors.primary[500], 0.08),
        },
      },
    },
  },
  
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
        padding: '8px',
      },
    },
  },
  
  MuiFab: {
    styleOverrides: {
      root: {
        background: `linear-gradient(135deg, ${nordiaColors.primary[500]}, ${nordiaColors.primary[600]})`,
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
        '&:hover': {
          background: `linear-gradient(135deg, ${nordiaColors.primary[600]}, ${nordiaColors.primary[700]})`,
          boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
        },
      },
    },
  },
};

// Tema principal (modo claro)
const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: nordiaColors.primary[500],
      light: nordiaColors.primary[400],
      dark: nordiaColors.primary[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: nordiaColors.secondary[500],
      light: nordiaColors.secondary[400],
      dark: nordiaColors.secondary[600],
      contrastText: '#ffffff',
    },
    success: {
      main: nordiaColors.success,
    },
    warning: {
      main: nordiaColors.warning,
    },
    error: {
      main: nordiaColors.error,
    },
    info: {
      main: nordiaColors.info,
    },
    background: {
      default: nordiaColors.gray[50],
      paper: '#ffffff',
    },
    text: {
      primary: nordiaColors.gray[900],
      secondary: nordiaColors.gray[600],
    },
    divider: nordiaColors.gray[200],
  },
  typography,
  components,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 2px 6px rgba(0, 0, 0, 0.07)',
    '0 4px 12px rgba(0, 0, 0, 0.08)',
    '0 6px 16px rgba(0, 0, 0, 0.09)',
    '0 8px 20px rgba(0, 0, 0, 0.10)',
    '0 12px 24px rgba(0, 0, 0, 0.11)',
    '0 16px 28px rgba(0, 0, 0, 0.12)',
    '0 20px 32px rgba(0, 0, 0, 0.13)',
    '0 24px 36px rgba(0, 0, 0, 0.14)',
    '0 28px 40px rgba(0, 0, 0, 0.15)',
    '0 32px 44px rgba(0, 0, 0, 0.16)',
    '0 36px 48px rgba(0, 0, 0, 0.17)',
    '0 40px 52px rgba(0, 0, 0, 0.18)',
    '0 44px 56px rgba(0, 0, 0, 0.19)',
    '0 48px 60px rgba(0, 0, 0, 0.20)',
    '0 52px 64px rgba(0, 0, 0, 0.21)',
    '0 56px 68px rgba(0, 0, 0, 0.22)',
    '0 60px 72px rgba(0, 0, 0, 0.23)',
    '0 64px 76px rgba(0, 0, 0, 0.24)',
    '0 68px 80px rgba(0, 0, 0, 0.25)',
    '0 72px 84px rgba(0, 0, 0, 0.26)',
    '0 76px 88px rgba(0, 0, 0, 0.27)',
    '0 80px 92px rgba(0, 0, 0, 0.28)',
    '0 84px 96px rgba(0, 0, 0, 0.29)',
  ],
};

// Tema neural (modo oscuro)
const neuralTheme: ThemeOptions = {
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: nordiaColors.primary[400],
      light: nordiaColors.primary[300],
      dark: nordiaColors.primary[500],
      contrastText: nordiaColors.gray[900],
    },
    secondary: {
      main: nordiaColors.secondary[400],
      light: nordiaColors.secondary[300],
      dark: nordiaColors.secondary[500],
      contrastText: nordiaColors.gray[900],
    },
    background: {
      default: nordiaColors.neural.background,
      paper: nordiaColors.neural.surface,
    },
    text: {
      primary: nordiaColors.gray[100],
      secondary: nordiaColors.gray[400],
    },
    divider: nordiaColors.neural.border,
  },
};

// Crear temas finales
export const nordiaLightTheme = createTheme(lightTheme);
export const nordiaNeuralTheme = createTheme(neuralTheme);

// Export default (tema claro)
export default nordiaLightTheme;

// Utilidades para el tema
export const useNordiaColors = () => nordiaColors;

export const getNordiaGradient = (color: 'primary' | 'secondary' = 'primary') => {
  const colors = color === 'primary' ? nordiaColors.primary : nordiaColors.secondary;
  return `linear-gradient(135deg, ${colors[500]}, ${colors[600]})`;
};

export const getNordiaGlassEffect = () => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${nordiaColors.gray[200]}`,
});
