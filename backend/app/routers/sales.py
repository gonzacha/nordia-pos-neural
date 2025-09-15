from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/sales", tags=["sales"])

class SaleItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

class Sale(BaseModel):
    id: Optional[str] = None
    items: List[SaleItem]
    total: float
    payment_method: str
    timestamp: Optional[datetime] = None
    customer_info: Optional[dict] = None

class SaleResponse(BaseModel):
    id: str
    total: float
    items_count: int
    timestamp: datetime
    neural_insights: Optional[dict] = None

# Storage temporal de ventas (en producción sería base de datos)
sales_storage = []

def process_neural_insights(sale_data: Sale) -> dict:
    """Procesar la venta con el motor neural y generar insights"""

    # Simulación de insights neurales
    insights = {
        "cross_selling": [],
        "inventory_alerts": [],
        "peak_hours": False,
        "category_trends": {}
    }

    # Cross-selling suggestions basado en productos vendidos
    product_categories = [item.product_name for item in sale_data.items]

    if any("Coca Cola" in p for p in product_categories):
        insights["cross_selling"].append({
            "product": "Papas Lay's 150g",
            "reason": "Complementa bebidas",
            "confidence": 0.85
        })

    if any("Pan" in p for p in product_categories):
        insights["cross_selling"].append({
            "product": "Manteca La Serenísima",
            "reason": "Producto complementario",
            "confidence": 0.78
        })

    # Alertas de inventario
    if sale_data.total > 2000:
        insights["inventory_alerts"].append({
            "message": "Venta alta detectada - verificar stock",
            "priority": "medium"
        })

    # Tendencias de horario
    current_hour = datetime.now().hour
    if 12 <= current_hour <= 14 or 18 <= current_hour <= 20:
        insights["peak_hours"] = True

    return insights

@router.post("/", response_model=SaleResponse)
async def create_sale(sale: Sale, background_tasks: BackgroundTasks):
    """Registrar una nueva venta"""

    # Generar ID y timestamp
    sale.id = str(uuid.uuid4())
    sale.timestamp = datetime.now()

    # Validar datos
    if not sale.items:
        raise HTTPException(status_code=400, detail="La venta debe tener al menos un producto")

    calculated_total = sum(item.total_price for item in sale.items)
    if abs(calculated_total - sale.total) > 0.01:
        raise HTTPException(status_code=400, detail="El total no coincide con los items")

    # Guardar venta
    sales_storage.append(sale)

    # Procesar insights neurales en background
    insights = process_neural_insights(sale)

    return SaleResponse(
        id=sale.id,
        total=sale.total,
        items_count=len(sale.items),
        timestamp=sale.timestamp,
        neural_insights=insights
    )

@router.get("/", response_model=List[Sale])
async def get_sales():
    """Obtener todas las ventas"""
    return sales_storage

@router.get("/{sale_id}", response_model=Sale)
async def get_sale(sale_id: str):
    """Obtener una venta específica"""
    sale = next((s for s in sales_storage if s.id == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return sale

@router.get("/analytics/today")
async def get_today_analytics():
    """Analíticas del día actual"""
    today_sales = [s for s in sales_storage if s.timestamp.date() == datetime.now().date()]

    total_revenue = sum(s.total for s in today_sales)
    total_transactions = len(today_sales)
    avg_ticket = total_revenue / total_transactions if total_transactions > 0 else 0

    return {
        "date": datetime.now().date(),
        "total_revenue": total_revenue,
        "total_transactions": total_transactions,
        "average_ticket": avg_ticket,
        "neural_status": "active"
    }