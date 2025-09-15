// services/OfflineStorage.ts - STORAGE OFFLINE SIMPLIFICADO
import { Product, SaleData, CartItem } from '../types';

// Simple storage service using localStorage
class OfflineStorageService {
  private readonly STORAGE_KEYS = {
    PRODUCTS: 'nordia-products',
    SALES: 'nordia-sales',
    CART: 'nordia-cart',
    SYNC_QUEUE: 'nordia-sync-queue',
    APP_STATE: 'nordia-app-state',
  };

  // Products
  async saveProduct(product: Product): Promise<void> {
    try {
      const products = this.getProducts();
      const index = products.findIndex(p => p.id === product.id);

      if (index >= 0) {
        products[index] = { ...product, lastUpdated: Date.now() };
      } else {
        products.push({ ...product, lastUpdated: Date.now() });
      }

      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  getProducts(): (Product & { lastUpdated: number })[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    const products = this.getProducts();
    return products.find(p => p.barcode === barcode) || null;
  }

  // Sales
  async saveSale(sale: SaleData & { id: string; synced: boolean }): Promise<void> {
    try {
      const sales = this.getSales();
      sales.push({ ...sale, timestamp: Date.now() });
      localStorage.setItem(this.STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  }

  getSales(): (SaleData & { id: string; synced: boolean; timestamp: number })[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SALES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting sales:', error);
      return [];
    }
  }

  // Cart
  async saveCart(cart: CartItem[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  // Sync Queue
  async addToSyncQueue(item: {
    type: 'sale' | 'product' | 'inventory';
    data: any;
    priority: 'low' | 'medium' | 'high';
  }): Promise<void> {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        id: `sync-${Date.now()}`,
        ...item,
        timestamp: Date.now(),
        retryCount: 0,
      });
      localStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  getSyncQueue(): Array<{
    id: string;
    type: 'sale' | 'product' | 'inventory';
    data: any;
    timestamp: number;
    retryCount: number;
    priority: 'low' | 'medium' | 'high';
  }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  // App State
  async saveAppState(key: string, value: any): Promise<void> {
    try {
      const state = this.getAppState();
      state[key] = { value, timestamp: Date.now() };
      localStorage.setItem(this.STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  }

  getAppState(): Record<string, { value: any; timestamp: number }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.APP_STATE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting app state:', error);
      return {};
    }
  }

  // Storage Stats
  getStorageStats() {
    let totalSize = 0;
    const stats: Record<string, number> = {};

    Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      const size = data ? new Blob([data]).size : 0;
      stats[key] = size;
      totalSize += size;
    });

    return {
      total: totalSize,
      breakdown: stats,
      formatted: this.formatBytes(totalSize),
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Cleanup
  async clearStorage(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  async clearOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAge;

    // Clean old products
    const products = this.getProducts().filter(p => p.lastUpdated > cutoff);
    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Clean old sales
    const sales = this.getSales().filter(s => s.timestamp > cutoff);
    localStorage.setItem(this.STORAGE_KEYS.SALES, JSON.stringify(sales));
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageService();

// React hook for using offline storage
export const useOfflineStorage = () => {
  const stats = offlineStorage.getStorageStats();

  return {
    offlineStorage,
    stats,
    updateStats: () => offlineStorage.getStorageStats(),
  };
};

export default OfflineStorageService;