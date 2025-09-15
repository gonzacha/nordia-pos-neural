// Tipos principales de la aplicación
export interface Store {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category: StoreCategory;
  subscriptionTier: 'free' | 'basic' | 'premium';
  isActive: boolean;
  neuralProfile?: NeuralProfile;
  createdAt: Date;
}

export type StoreCategory = 
  | 'almacen' 
  | 'farmacia' 
  | 'kiosco' 
  | 'panaderia' 
  | 'verduleria' 
  | 'rotiseria' 
  | 'otros';

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
  category: string;
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

export interface Sale {
  id: string;
  storeId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryStatus: DeliveryStatus;
  deliveryCost: number;
  items: SaleItem[];
  whatsappMessageId?: string;
  notificationSent: boolean;
  predictedDeliveryTime?: number;
  customerSegment?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'mercadopago' 
  | 'transfer' 
  | 'qr';

export type DeliveryStatus = 
  | 'pending' 
  | 'preparing' 
  | 'ready' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface Insight {
  id: string;
  storeId: string;
  type: InsightType;
  title: string;
  message: string;
  actionable: boolean;
  priority: InsightPriority;
  data?: Record<string, any>;
  readAt?: Date;
  actedUpon: boolean;
  createdAt: Date;
}

export type InsightType = 
  | 'price_alert' 
  | 'stock_prediction' 
  | 'market_trend' 
  | 'demand_spike' 
  | 'competitor_analysis' 
  | 'cross_sell_opportunity';

export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

export interface DataConsentSettings {
  // Datos básicos (requeridos para insights)
  salesVolume: boolean;
  timePatterns: boolean;
  productCategories: boolean;
  
  // Datos avanzados (opcionales)
  priceRanges: boolean;
  customerSegments: boolean;
  deliveryPatterns: boolean;
  
  // Controles de privacidad (siempre true)
  optOutAnytime: boolean;
  dataDownload: boolean;
  deleteRequest: boolean;
}

export interface AnonymizedSaleData {
  anonymousStoreId: string;
  productCategory: string;
  priceRange: 'bajo' | 'medio' | 'alto' | 'premium';
  quantityRange: string;
  timeSegment: string;
  geoSegment: string;
  dayOfWeek: number;
  isWeekend: boolean;
}

export interface NeuralProfile {
  storeType: string;
  averageTicket: number;
  peakHours: number[];
  topCategories: string[];
  customerSegments: string[];
  deliveryRadius: number;
  competitorProximity: number;
}

export interface NetworkEvent {
  id: string;
  eventType: string;
  sourceStoreId?: string;
  targetStoreId?: string;
  productId?: string;
  data: Record<string, any>;
  processed: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'employee';
  storeId: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Offline Types
export interface OfflineSale {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  timestamp: number;
  customerInfo?: {
    name: string;
    phone: string;
  };
  synced: boolean;
}

export interface SyncStatus {
  lastSync: Date | null;
  pendingSales: number;
  pendingProducts: number;
  isOnline: boolean;
  isSyncing: boolean;
}
