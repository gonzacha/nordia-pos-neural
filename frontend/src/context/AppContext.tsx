// context/AppContext.tsx - ESTADO GLOBAL MEJORADO
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Product, AppState, SaleData } from '../types';

// State interface
interface AppContextState {
  // App state
  isOnline: boolean;
  currentStore?: string;
  lastSync?: Date;
  
  // Cart state
  cart: CartItem[];
  cartTotal: number;
  cartItemsCount: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Scanner state
  scannerOpen: boolean;
  lastScannedCode?: string;
  
  // Sales state
  pendingSales: SaleData[];
  completedSalesCount: number;
}

// Action types
type AppAction =
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SCANNER_OPEN'; payload: boolean }
  | { type: 'SET_LAST_SCANNED'; payload: string }
  | { type: 'ADD_PENDING_SALE'; payload: SaleData }
  | { type: 'COMPLETE_SALE'; payload: string }
  | { type: 'SYNC_COMPLETED' };

// Initial state
const initialState: AppContextState = {
  isOnline: navigator.onLine,
  cart: [],
  cartTotal: 0,
  cartItemsCount: 0,
  isLoading: false,
  error: null,
  successMessage: null,
  scannerOpen: false,
  pendingSales: [],
  completedSalesCount: 0,
};

// Reducer
function appReducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, successMessage: null };
      
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload, error: null };
      
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      let newCart: CartItem[];
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...state.cart, { ...action.payload, quantity: 1 }];
      }
      
      return {
        ...state,
        cart: newCart,
        cartTotal: calculateCartTotal(newCart),
        cartItemsCount: calculateCartItemsCount(newCart),
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter(item => item.id !== action.payload);
      return {
        ...state,
        cart: newCart,
        cartTotal: calculateCartTotal(newCart),
        cartItemsCount: calculateCartItemsCount(newCart),
      };
    }
    
    case 'UPDATE_CART_QUANTITY': {
      const newCart = action.payload.quantity <= 0
        ? state.cart.filter(item => item.id !== action.payload.id)
        : state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          );
      
      return {
        ...state,
        cart: newCart,
        cartTotal: calculateCartTotal(newCart),
        cartItemsCount: calculateCartItemsCount(newCart),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        cartTotal: 0,
        cartItemsCount: 0,
      };
      
    case 'SET_SCANNER_OPEN':
      return { ...state, scannerOpen: action.payload };
      
    case 'SET_LAST_SCANNED':
      return { ...state, lastScannedCode: action.payload };
      
    case 'ADD_PENDING_SALE':
      return {
        ...state,
        pendingSales: [...state.pendingSales, action.payload],
      };
      
    case 'COMPLETE_SALE':
      return {
        ...state,
        pendingSales: state.pendingSales.filter((_, index) => index.toString() !== action.payload),
        completedSalesCount: state.completedSalesCount + 1,
      };
      
    case 'SYNC_COMPLETED':
      return {
        ...state,
        lastSync: new Date(),
        pendingSales: [],
      };
      
    default:
      return state;
  }
}

// Helper functions
function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateCartItemsCount(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Context
const AppContext = createContext<{
  state: AppContextState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nordia-cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart) as CartItem[];
        cart.forEach(item => {
          dispatch({ type: 'ADD_TO_CART', payload: item });
        });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('nordia-cart', JSON.stringify(state.cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.cart]);

  // Auto-clear messages after delay
  useEffect(() => {
    if (state.error || state.successMessage) {
      const timer = setTimeout(() => {
        if (state.error) dispatch({ type: 'SET_ERROR', payload: null });
        if (state.successMessage) dispatch({ type: 'SET_SUCCESS', payload: null });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.error, state.successMessage]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Action creators (optional, for better DX)
export const useAppActions = () => {
  const { dispatch } = useAppContext();

  return {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setSuccess: (message: string | null) => dispatch({ type: 'SET_SUCCESS', payload: message }),
    
    // Cart actions
    addToCart: (product: Product) => dispatch({ type: 'ADD_TO_CART', payload: product }),
    removeFromCart: (id: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: id }),
    updateCartQuantity: (id: string, quantity: number) => 
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    
    // Scanner actions
    openScanner: () => dispatch({ type: 'SET_SCANNER_OPEN', payload: true }),
    closeScanner: () => dispatch({ type: 'SET_SCANNER_OPEN', payload: false }),
    setLastScanned: (code: string) => dispatch({ type: 'SET_LAST_SCANNED', payload: code }),
    
    // Sales actions
    addPendingSale: (sale: SaleData) => dispatch({ type: 'ADD_PENDING_SALE', payload: sale }),
    completeSale: (saleId: string) => dispatch({ type: 'COMPLETE_SALE', payload: saleId }),
    syncCompleted: () => dispatch({ type: 'SYNC_COMPLETED' }),
  };
};

// Selectors (for computed values)
export const useCartSelectors = () => {
  const { state } = useAppContext();
  
  return {
    cart: state.cart,
    cartTotal: state.cartTotal,
    cartItemsCount: state.cartItemsCount,
    isEmpty: state.cart.length === 0,
    getCartItem: (id: string) => state.cart.find(item => item.id === id),
  };
};

export const useAppSelectors = () => {
  const { state } = useAppContext();
  
  return {
    isOnline: state.isOnline,
    isLoading: state.isLoading,
    error: state.error,
    successMessage: state.successMessage,
    scannerOpen: state.scannerOpen,
    lastScannedCode: state.lastScannedCode,
    pendingSales: state.pendingSales,
    completedSalesCount: state.completedSalesCount,
    needsSync: state.pendingSales.length > 0,
  };
};
