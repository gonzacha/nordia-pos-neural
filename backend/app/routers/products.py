from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/products", tags=["products"])

class Product(BaseModel):
    id: str
    name: str
    price: float
    category: str
    stock: int
    barcode: str = None

# Base de productos demo (mismos que el frontend)
DEMO_PRODUCTS = [
    # Bebidas
    Product(id='1', name='Coca Cola 500ml', price=350, category='Bebidas', stock=48, barcode='7790895001234'),
    Product(id='2', name='Agua Mineral 500ml', price=200, category='Bebidas', stock=120, barcode='7794000123456'),
    Product(id='3', name='Café La Virginia 500g', price=2800, category='Bebidas', stock=25, barcode='7790742001234'),
    Product(id='4', name='Fernet Branca 750ml', price=4500, category='Bebidas', stock=12, barcode='7793241001234'),
    Product(id='5', name='Cerveza Quilmes 473ml', price=380, category='Bebidas', stock=36, barcode='7790070001234'),

    # Panadería y Snacks
    Product(id='6', name='Pan Lactal', price=650, category='Panadería', stock=30),
    Product(id='7', name='Medialunas x6', price=420, category='Panadería', stock=20),
    Product(id='8', name='Oreo Original', price=480, category='Snacks', stock=45),
    Product(id='9', name='Papas Lay\'s 150g', price=520, category='Snacks', stock=35),
    Product(id='10', name='Alfajor Havanna', price=320, category='Snacks', stock=60),

    # Lácteos
    Product(id='11', name='Leche La Serenísima 1L', price=480, category='Lácteos', stock=40),
    Product(id='12', name='Yogur Ser 120g', price=150, category='Lácteos', stock=55),
    Product(id='13', name='Queso Cremoso', price=1200, category='Lácteos', stock=18),
    Product(id='14', name='Manteca La Serenísima', price=680, category='Lácteos', stock=25),

    # Limpieza
    Product(id='15', name='Detergente Magistral', price=850, category='Limpieza', stock=22),
    Product(id='16', name='Papel Higiénico Elite x4', price=920, category='Limpieza', stock=30),
    Product(id='17', name='Lavandina Ayudín 1L', price=320, category='Limpieza', stock=28),

    # Almacén
    Product(id='18', name='Arroz Gallo Oro 1kg', price=750, category='Almacén', stock=50),
    Product(id='19', name='Aceite Natura 900ml', price=980, category='Almacén', stock=35),
    Product(id='20', name='Fideos Matarazzo 500g', price=380, category='Almacén', stock=45),
    Product(id='21', name='Azúcar Ledesma 1kg', price=520, category='Almacén', stock=40),
    Product(id='22', name='Sal Entrefina 500g', price=180, category='Almacén', stock=60),

    # Cigarrillos
    Product(id='23', name='Marlboro Box', price=1850, category='Cigarrillos', stock=15),
    Product(id='24', name='Philip Morris', price=1750, category='Cigarrillos', stock=12),

    # Varios
    Product(id='25', name='Pilas AA Duracell x4', price=1200, category='Varios', stock=25),
    Product(id='26', name='Preservativos Prime x3', price=890, category='Varios', stock=18)
]

@router.get("/", response_model=List[Product])
async def get_products():
    """Obtener todos los productos"""
    return DEMO_PRODUCTS

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Obtener un producto específico"""
    product = next((p for p in DEMO_PRODUCTS if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@router.get("/category/{category}")
async def get_products_by_category(category: str):
    """Obtener productos por categoría"""
    products = [p for p in DEMO_PRODUCTS if p.category.lower() == category.lower()]
    return products

@router.get("/search/{query}")
async def search_products(query: str):
    """Buscar productos por nombre"""
    query_lower = query.lower()
    products = [
        p for p in DEMO_PRODUCTS
        if query_lower in p.name.lower() or query_lower in p.category.lower()
    ]
    return products

@router.get("/barcode/{barcode}")
async def get_product_by_barcode(barcode: str):
    """Buscar producto por código de barras"""
    product = next((p for p in DEMO_PRODUCTS if p.barcode == barcode), None)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product