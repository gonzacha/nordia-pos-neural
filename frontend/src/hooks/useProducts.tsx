import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export function useProducts() {
  const [products] = useState<Product[]>([
    // Bebidas
    { id: '1', name: 'Coca Cola 500ml', price: 350, category: 'Bebidas', stock: 48 },
    { id: '2', name: 'Agua Mineral 500ml', price: 200, category: 'Bebidas', stock: 120 },
    { id: '3', name: 'Café La Virginia 500g', price: 2800, category: 'Bebidas', stock: 25 },
    { id: '4', name: 'Fernet Branca 750ml', price: 4500, category: 'Bebidas', stock: 12 },
    { id: '5', name: 'Cerveza Quilmes 473ml', price: 380, category: 'Bebidas', stock: 36 },

    // Panadería y Snacks
    { id: '6', name: 'Pan Lactal', price: 650, category: 'Panadería', stock: 30 },
    { id: '7', name: 'Medialunas x6', price: 420, category: 'Panadería', stock: 20 },
    { id: '8', name: 'Oreo Original', price: 480, category: 'Snacks', stock: 45 },
    { id: '9', name: 'Papas Lay\'s 150g', price: 520, category: 'Snacks', stock: 35 },
    { id: '10', name: 'Alfajor Havanna', price: 320, category: 'Snacks', stock: 60 },

    // Lácteos
    { id: '11', name: 'Leche La Serenísima 1L', price: 480, category: 'Lácteos', stock: 40 },
    { id: '12', name: 'Yogur Ser 120g', price: 150, category: 'Lácteos', stock: 55 },
    { id: '13', name: 'Queso Cremoso', price: 1200, category: 'Lácteos', stock: 18 },
    { id: '14', name: 'Manteca La Serenísima', price: 680, category: 'Lácteos', stock: 25 },

    // Limpieza
    { id: '15', name: 'Detergente Magistral', price: 850, category: 'Limpieza', stock: 22 },
    { id: '16', name: 'Papel Higiénico Elite x4', price: 920, category: 'Limpieza', stock: 30 },
    { id: '17', name: 'Lavandina Ayudín 1L', price: 320, category: 'Limpieza', stock: 28 },

    // Almacén
    { id: '18', name: 'Arroz Gallo Oro 1kg', price: 750, category: 'Almacén', stock: 50 },
    { id: '19', name: 'Aceite Natura 900ml', price: 980, category: 'Almacén', stock: 35 },
    { id: '20', name: 'Fideos Matarazzo 500g', price: 380, category: 'Almacén', stock: 45 },
    { id: '21', name: 'Azúcar Ledesma 1kg', price: 520, category: 'Almacén', stock: 40 },
    { id: '22', name: 'Sal Entrefina 500g', price: 180, category: 'Almacén', stock: 60 },

    // Cigarrillos
    { id: '23', name: 'Marlboro Box', price: 1850, category: 'Cigarrillos', stock: 15 },
    { id: '24', name: 'Philip Morris', price: 1750, category: 'Cigarrillos', stock: 12 },

    // Varios
    { id: '25', name: 'Pilas AA Duracell x4', price: 1200, category: 'Varios', stock: 25 },
    { id: '26', name: 'Preservativos Prime x3', price: 890, category: 'Varios', stock: 18 }
  ]);

  return { products };
}