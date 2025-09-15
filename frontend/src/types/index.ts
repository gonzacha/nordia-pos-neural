// types/index.ts - MEJORADO
export interface Product {
  id: string;
  storeId?: string;
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  category: ProductCategory;
  brand?: string;
  supplier?: string;
  image?: string;
  isActive?: boolean;
  salesVelocity?: number;
  priceElasticity?: number;
  seasonalityFactor?: number;
  isExternal?: boolean;
  isUnknown?: boolean;
  needsCompletion?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductCategory = 
  | 'bebidas' 
  | 'snacks' 
  | 'lacteos' 
  | 'panaderia' 
  | 'limpieza' 
  | 'cigarrillos' 
  | 'almacen'
  | 'varios'
  | 'otros';

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleData {
  items: SaleItemData[];
  total: number;
  payment_method: PaymentMethod;
  customer_info?: CustomerInfo | null;
}

export interface SaleItemData {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago' | 'qr';

export interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
}

export interface NeuralInsights {
  cross_selling: CrossSellingInsight[];
  inventory_alerts: InventoryAlert[];
  peak_hours: boolean;
  category_trends: Record<string, any>;
}

export interface CrossSellingInsight {
  product: string;
  reason: string;
  confidence: number;
}

export interface InventoryAlert {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SaleResponse {
  id: string;
  total: number;
  items_count: number;
  timestamp: Date;
  neural_insights?: NeuralInsights;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Scanner types
export interface ScannerConfig {
  enableSound: boolean;
  enableVibration: boolean;
  autoStop: boolean;
  timeout: number;
}

// Store/App State
export interface AppState {
  isOnline: boolean;
  currentStore?: string;
  lastSync?: Date;
  pendingSales: number;
}
