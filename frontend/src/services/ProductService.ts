import React, { useState } from 'react';
import { Product } from '../types';

// Servicio para manejar productos con API externa y carga manual
export class ProductService {
  private static OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product/';
  private static COSMOS_API = 'https://api.cosmos.bluesoft.com.br/products/';
  
  // Cache local para productos ya consultados
  private static productCache = new Map<string, Product>();

  static async findProductByBarcode(barcode: string): Promise<Product | null> {
    // 1. Buscar en cache local primero
    if (this.productCache.has(barcode)) {
      return this.productCache.get(barcode)!;
    }

    // 2. Buscar en base de datos local (tu backend)
    try {
      const localResponse = await fetch(`/api/products/barcode/${barcode}`);
      if (localResponse.ok) {
        const product = await localResponse.json();
        this.productCache.set(barcode, product);
        return product;
      }
    } catch (error) {
      console.log('Local DB not available, trying external APIs');
    }

    // 3. Buscar en APIs externas
    const externalProduct = await this.searchExternalAPIs(barcode);
    if (externalProduct) {
      // Guardar en local para futuro uso
      this.saveToLocalDB(externalProduct);
      this.productCache.set(barcode, externalProduct);
      return externalProduct;
    }

    return null;
  }

  private static async searchExternalAPIs(barcode: string): Promise<Product | null> {
    // OpenFoodFacts (productos alimenticios)
    try {
      const response = await fetch(`${this.OPEN_FOOD_FACTS_API}${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return this.mapOpenFoodFactsProduct(data.product, barcode);
      }
    } catch (error) {
      console.log('OpenFoodFacts API error:', error);
    }

    // Cosmos API (productos brasileños, pero tiene muchos argentinos)
    try {
      const response = await fetch(`${this.COSMOS_API}${barcode}`, {
        headers: {
          'X-Cosmos-Token': process.env.VITE_COSMOS_API_TOKEN || ''
        }
      });
      const data = await response.json();
      
      if (data.product) {
        return this.mapCosmosProduct(data.product, barcode);
      }
    } catch (error) {
      console.log('Cosmos API error:', error);
    }

    return null;
  }

  private static mapOpenFoodFactsProduct(product: any, barcode: string): Product {
    return {
      id: `off-${barcode}`,
      name: product.product_name || `Producto ${barcode.slice(-4)}`,
      price: 0, // Precio a definir por el comerciante
      barcode,
      category: this.categorizeProduct(product.categories_tags),
      brand: product.brands || '',
      image: product.image_url,
      stock: 0,
      description: product.ingredients_text,
      isExternal: true
    };
  }

  private static mapCosmosProduct(product: any, barcode: string): Product {
    return {
      id: `cosmos-${barcode}`,
      name: product.description || `Producto ${barcode.slice(-4)}`,
      price: 0,
      barcode,
      category: product.category?.name || 'Otros',
      brand: product.brand?.name || '',
      image: product.images?.[0]?.url,
      stock: 0,
      isExternal: true
    };
  }

  private static categorizeProduct(categories: string[]): string {
    if (!categories) return 'Otros';
    
    const categoryMap = {
      'bebidas': ['beverages', 'drinks', 'agua', 'gaseosa'],
      'lacteos': ['dairy', 'milk', 'cheese', 'yogurt'],
      'panaderia': ['bread', 'bakery', 'cookies'],
      'snacks': ['snacks', 'chips', 'crackers'],
      'limpieza': ['cleaning', 'detergent', 'soap']
    };

    for (const [key, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => 
        categories.some(cat => cat.toLowerCase().includes(keyword))
      )) {
        return key;
      }
    }

    return 'Otros';
  }

  static async saveToLocalDB(product: Product): Promise<void> {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch (error) {
      console.log('Could not save to local DB:', error);
    }
  }

  // Para productos no encontrados - crear manualmente
  static createUnknownProduct(barcode: string): Product {
    return {
      id: `unknown-${barcode}`,
      name: `Producto ${barcode.slice(-4)}`,
      price: 0,
      barcode,
      category: 'Sin categoría',
      stock: 1,
      isUnknown: true,
      needsCompletion: true
    };
  }
}


// Hook para manejar productos con todas las fuentes
export const useProductManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [productToComplete, setProductToComplete] = useState<Product | null>(null);

  const findProduct = async (barcode: string): Promise<Product> => {
    setIsLoading(true);
    
    try {
      // Buscar en todas las fuentes
      let product = await ProductService.findProductByBarcode(barcode);
      
      if (!product) {
        // Crear producto desconocido y abrir modal para completar
        product = ProductService.createUnknownProduct(barcode);
        setProductToComplete(product);
        setCompletionModalOpen(true);
      }
      
      return product;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProduct = async (completedProduct: Product) => {
    // Guardar en base de datos local
    await ProductService.saveToLocalDB(completedProduct);
    setCompletionModalOpen(false);
    setProductToComplete(null);
    return completedProduct;
  };

  return {
    findProduct,
    completeProduct,
    isLoading,
    completionModalOpen,
    productToComplete,
    setCompletionModalOpen
  };
};
