// services/ProductService.ts - REFACTORIZADO
import { useState, useCallback } from 'react';
import { Product, ProductCategory } from '../types';

export interface ProductSearchResult {
  product: Product | null;
  source: 'mock' | 'local' | 'openfoodfacts' | 'cosmos' | 'unknown';
  confidence: number;
}

export class ProductService {
  private static readonly OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product/';
  private static readonly COSMOS_API = 'https://api.cosmos.bluesoft.com.br/products/';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas
  
  // Cache mejorado con timestamps
  private static productCache = new Map<string, { product: Product; timestamp: number }>();

  // Mock products mejorado - más productos argentinos
  private static readonly MOCK_PRODUCTS: Record<string, Product> = {
    // Bebidas
    '7790895001234': { 
      id: 'mock-1', name: 'Coca Cola 500ml', price: 450, category: 'bebidas', 
      stock: 48, barcode: '7790895001234', brand: 'Coca Cola', description: 'Gaseosa cola 500ml'
    },
    '7794000123456': { 
      id: 'mock-2', name: 'Agua Mineral Villavicencio 500ml', price: 280, category: 'bebidas', 
      stock: 120, barcode: '7794000123456', brand: 'Villavicencio'
    },
    '7790742001234': { 
      id: 'mock-3', name: 'Café La Virginia Molido 500g', price: 3200, category: 'bebidas', 
      stock: 25, barcode: '7790742001234', brand: 'La Virginia'
    },
    '7793241001234': { 
      id: 'mock-4', name: 'Fernet Branca 750ml', price: 5200, category: 'bebidas', 
      stock: 12, barcode: '7793241001234', brand: 'Branca'
    },
    '7790070001234': { 
      id: 'mock-5', name: 'Cerveza Quilmes Lata 473ml', price: 420, category: 'bebidas', 
      stock: 36, barcode: '7790070001234', brand: 'Quilmes'
    },
    
    // Lácteos
    '7790070000001': {
      id: 'mock-6', name: 'Leche La Serenísima Entera 1L', price: 580, category: 'lacteos',
      stock: 40, barcode: '7790070000001', brand: 'La Serenísima'
    },
    '7790070000002': {
      id: 'mock-7', name: 'Yogur Ser Natural 120g', price: 180, category: 'lacteos',
      stock: 55, barcode: '7790070000002', brand: 'Ser'
    },
    
    // Snacks
    '7790070000003': {
      id: 'mock-8', name: 'Papas Lay\'s Clásicas 150g', price: 680, category: 'snacks',
      stock: 35, barcode: '7790070000003', brand: 'Lay\'s'
    },
    '7790070000004': {
      id: 'mock-9', name: 'Alfajor Havanna Mixto', price: 380, category: 'snacks',
      stock: 60, barcode: '7790070000004', brand: 'Havanna'
    },
  };

  static async findProductByBarcode(barcode: string): Promise<ProductSearchResult> {
    console.log(`🔍 Buscando producto con código: ${barcode}`);

    try {
      // 1. Verificar cache (con expiración)
      const cached = this.productCache.get(barcode);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_EXPIRY) {
        console.log('✅ Producto encontrado en cache');
        return { product: cached.product, source: 'local', confidence: 1.0 };
      }

      // 2. Buscar en productos mock primero (para desarrollo)
      const mockProduct = this.MOCK_PRODUCTS[barcode];
      if (mockProduct) {
        console.log('✅ Producto encontrado en mock database');
        this.setCacheProduct(barcode, mockProduct);
        return { product: mockProduct, source: 'mock', confidence: 1.0 };
      }

      // 3. Buscar en base de datos local (tu backend)
      const localResult = await this.searchLocalDatabase(barcode);
      if (localResult) {
        console.log('✅ Producto encontrado en base local');
        this.setCacheProduct(barcode, localResult);
        return { product: localResult, source: 'local', confidence: 1.0 };
      }

      // 4. Buscar en APIs externas
      const externalResult = await this.searchExternalAPIs(barcode);
      if (externalResult.product) {
        console.log(`✅ Producto encontrado en ${externalResult.source}`);
        // Guardar en local para futuro uso
        await this.saveToLocalDatabase(externalResult.product);
        this.setCacheProduct(barcode, externalResult.product);
        return externalResult;
      }

      // 5. No encontrado - crear producto desconocido
      console.log('❓ Producto no encontrado, creando entrada desconocida');
      const unknownProduct = this.createUnknownProduct(barcode);
      return { product: unknownProduct, source: 'unknown', confidence: 0.0 };

    } catch (error) {
      console.error('❌ Error en búsqueda de producto:', error);
      const unknownProduct = this.createUnknownProduct(barcode);
      return { product: unknownProduct, source: 'unknown', confidence: 0.0 };
    }
  }

  private static async searchLocalDatabase(barcode: string): Promise<Product | null> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/products/barcode/${barcode}`, {
        timeout: 5000, // 5 segundos timeout
      } as any);

      if (response.ok) {
        const product = await response.json();
        return this.normalizeProduct(product);
      }
      return null;
    } catch (error) {
      console.log('Local database not available:', error);
      return null;
    }
  }

  private static async searchExternalAPIs(barcode: string): Promise<ProductSearchResult> {
    // Intentar OpenFoodFacts primero (es gratis y tiene buenos datos)
    const offResult = await this.searchOpenFoodFacts(barcode);
    if (offResult.product) {
      return offResult;
    }

    // Si no funciona, intentar Cosmos (requiere API key)
    const cosmosResult = await this.searchCosmos(barcode);
    if (cosmosResult.product) {
      return cosmosResult;
    }

    return { product: null, source: 'unknown', confidence: 0.0 };
  }

  private static async searchOpenFoodFacts(barcode: string): Promise<ProductSearchResult> {
    try {
      const response = await fetch(`${this.OPEN_FOOD_FACTS_API}${barcode}.json`, {
        timeout: 8000,
      } as any);
      
      if (!response.ok) {
        return { product: null, source: 'openfoodfacts', confidence: 0.0 };
      }

      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = this.mapOpenFoodFactsProduct(data.product, barcode);
        const confidence = this.calculateConfidence(data.product);
        return { product, source: 'openfoodfacts', confidence };
      }

      return { product: null, source: 'openfoodfacts', confidence: 0.0 };
    } catch (error) {
      console.log('OpenFoodFacts API error:', error);
      return { product: null, source: 'openfoodfacts', confidence: 0.0 };
    }
  }

  private static async searchCosmos(barcode: string): Promise<ProductSearchResult> {
    try {
      const apiKey = import.meta.env.VITE_COSMOS_API_TOKEN;
      if (!apiKey) {
        return { product: null, source: 'cosmos', confidence: 0.0 };
      }

      const response = await fetch(`${this.COSMOS_API}${barcode}`, {
        headers: {
          'X-Cosmos-Token': apiKey,
        },
        timeout: 8000,
      } as any);

      if (!response.ok) {
        return { product: null, source: 'cosmos', confidence: 0.0 };
      }

      const data = await response.json();
      
      if (data.product) {
        const product = this.mapCosmosProduct(data.product, barcode);
        return { product, source: 'cosmos', confidence: 0.8 };
      }

      return { product: null, source: 'cosmos', confidence: 0.0 };
    } catch (error) {
      console.log('Cosmos API error:', error);
      return { product: null, source: 'cosmos', confidence: 0.0 };
    }
  }

  private static mapOpenFoodFactsProduct(product: any, barcode: string): Product {
    const name = product.product_name || product.product_name_es || `Producto ${barcode.slice(-4)}`;
    const category = this.categorizeProduct(product.categories_tags || []);
    
    return {
      id: `off-${barcode}`,
      name: name.slice(0, 100), // Limitar longitud
      price: 0, // Precio a definir por el comerciante
      barcode,
      category,
      brand: product.brands?.split(',')[0]?.trim() || '',
      image: product.image_url,
      stock: 0,
      description: product.ingredients_text_es || product.ingredients_text,
      isExternal: true,
      needsCompletion: true, // Necesita que el comerciante complete el precio
    };
  }

  private static mapCosmosProduct(product: any, barcode: string): Product {
    return {
      id: `cosmos-${barcode}`,
      name: (product.description || `Producto ${barcode.slice(-4)}`).slice(0, 100),
      price: 0,
      barcode,
      category: this.categorizeFromText(product.category?.name || ''),
      brand: product.brand?.name || '',
      image: product.images?.[0]?.url,
      stock: 0,
      isExternal: true,
      needsCompletion: true,
    };
  }

  private static categorizeProduct(categories: string[]): ProductCategory {
    if (!categories || categories.length === 0) return 'otros';

    const categoryMap: Record<ProductCategory, string[]> = {
      'bebidas': ['beverages', 'drinks', 'agua', 'gaseosa', 'jugo', 'cerveza', 'vino'],
      'lacteos': ['dairy', 'milk', 'cheese', 'yogurt', 'leche', 'queso', 'manteca'],
      'panaderia': ['bread', 'bakery', 'cookies', 'pan', 'galleta', 'factura'],
      'snacks': ['snacks', 'chips', 'crackers', 'papas', 'maní'],
      'limpieza': ['cleaning', 'detergent', 'soap', 'lavandina', 'jabón'],
      'cigarrillos': ['tobacco', 'cigarette', 'cigarrillo'],
      'almacen': ['rice', 'pasta', 'oil', 'arroz', 'fideos', 'aceite', 'azúcar'],
      'varios': ['varios', 'other'],
      'otros': ['otros', 'miscellaneous']
    };

    const categoryText = categories.join(' ').toLowerCase();

    for (const [key, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((keyword: string) => categoryText.includes(keyword))) {
        return key as ProductCategory;
      }
    }

    return 'otros';
  }

  private static categorizeFromText(text: string): ProductCategory {
    return this.categorizeProduct([text]);
  }

  private static calculateConfidence(product: any): number {
    let confidence = 0.5; // Base confidence
    
    if (product.product_name) confidence += 0.2;
    if (product.brands) confidence += 0.1;
    if (product.image_url) confidence += 0.1;
    if (product.categories_tags?.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  static createUnknownProduct(barcode: string): Product {
    return {
      id: `unknown-${barcode}`,
      name: `Producto ${barcode.slice(-4)}`,
      price: 0,
      barcode,
      category: 'otros',
      stock: 1,
      isUnknown: true,
      needsCompletion: true,
    };
  }

  private static normalizeProduct(product: any): Product {
    return {
      ...product,
      category: product.category || 'otros',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
    };
  }

  private static setCacheProduct(barcode: string, product: Product): void {
    this.productCache.set(barcode, {
      product,
      timestamp: Date.now()
    });
  }

  static async saveToLocalDatabase(product: Product): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
        timeout: 5000,
      } as any);
    } catch (error) {
      console.log('Could not save to local DB:', error);
    }
  }

  // Métodos de utilidad
  static clearCache(): void {
    this.productCache.clear();
  }

  static getCacheSize(): number {
    return this.productCache.size;
  }
}

// Hook mejorado para manejar productos
export const useProductManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [productToComplete, setProductToComplete] = useState<Product | null>(null);

  const findProduct = useCallback(async (barcode: string): Promise<Product> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ProductService.findProductByBarcode(barcode);
      
      if (!result.product) {
        throw new Error('No se pudo obtener información del producto');
      }
      
      // Si el producto necesita completarse, abrir modal
      if (result.product.needsCompletion) {
        setProductToComplete(result.product);
        setCompletionModalOpen(true);
      }
      
      return result.product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      // En caso de error, crear producto desconocido
      const unknownProduct = ProductService.createUnknownProduct(barcode);
      setProductToComplete(unknownProduct);
      setCompletionModalOpen(true);
      return unknownProduct;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeProduct = useCallback(async (completedProduct: Product): Promise<Product> => {
    try {
      // Guardar en base de datos local
      await ProductService.saveToLocalDatabase(completedProduct);
      
      setCompletionModalOpen(false);
      setProductToComplete(null);
      setError(null);
      
      return completedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar producto';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const closeCompletionModal = useCallback(() => {
    setCompletionModalOpen(false);
    setProductToComplete(null);
    setError(null);
  }, []);

  return {
    findProduct,
    completeProduct,
    closeCompletionModal,
    isLoading,
    error,
    completionModalOpen,
    productToComplete,
    setCompletionModalOpen,
  };
};
