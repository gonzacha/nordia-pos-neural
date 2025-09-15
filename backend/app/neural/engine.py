import asyncio
import numpy as np
import pandas as pd
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..core.database import get_db
from ..models.models import Store, Product, Sale, Insight, NetworkEvent, AnonymizedData
from ..integrations.whatsapp import WhatsAppService

class NeuralEngine:
    """
    Motor neural de Nordia que procesa datos anónimos y genera insights colectivos
    """
    
    def __init__(self):
        self.is_running = False
        self.insights_cache = {}
        self.market_data = {}
        self.whatsapp = WhatsAppService()
        self.salt = "nordia_neural_salt_2025"
        self.aggregation_threshold = 5  # Mínimo 5 comercios para publicar insights
        
    async def initialize(self):
        """Inicializa el motor neural"""
        self.is_running = True
        # Comenzar el loop de procesamiento en background
        asyncio.create_task(self.neural_processing_loop())
        
    async def cleanup(self):
        """Limpia recursos"""
        self.is_running = False
        
    def is_healthy(self) -> bool:
        return self.is_running
        
    async def neural_processing_loop(self):
        """Loop principal que ejecuta análisis neural cada 5 minutos"""
        while self.is_running:
            try:
                await self.process_network_insights()
                await self.detect_market_anomalies()
                await self.update_price_recommendations()
                await self.predict_stock_needs()
                await asyncio.sleep(300)  # 5 minutos
            except Exception as e:
                print(f"Error in neural processing: {e}")
                await asyncio.sleep(60)  # Retry en 1 minuto si hay error
    
    def anonymize_sale(self, sale_data: Dict) -> Dict:
        """
        Anonimiza una venta individual manteniendo valor analítico
        """
        # Generar ID anónimo consistente para el comercio
        store_hash = hashlib.sha256(
            (sale_data["store_id"] + self.salt).encode()
        ).hexdigest()[:12]
        
        # Categorizar productos sin nombres específicos
        product_category = self._categorize_product(sale_data.get("product_name", ""))
        
        # Segmentar tiempo y ubicación
        time_segment = self._get_time_segment(sale_data["timestamp"])
        geo_segment = self._get_geo_segment(sale_data.get("store_location", {}))
        
        return {
            "anonymous_store_id": store_hash,
            "product_category": product_category,
            "price_range": self._get_price_range(sale_data["price"]),
            "quantity_range": self._get_quantity_range(sale_data["quantity"]),
            "time_segment": time_segment,
            "geo_segment": geo_segment,
            "day_of_week": sale_data["timestamp"].weekday(),
            "is_weekend": sale_data["timestamp"].weekday() >= 5
        }
    
    async def generate_market_insights(self, db: Session, geo_area: str) -> List[Dict]:
        """
        Genera insights de mercado solo si hay suficientes comercios
        """
        # Contar comercios activos en el área
        active_stores = await self._count_active_stores(db, geo_area)
        
        if active_stores < self.aggregation_threshold:
            return []  # No hay suficientes datos para preservar anonimato
        
        insights = []
        
        # Insight de tendencias de precios por categoría
        price_trends = await self._analyze_price_trends(db, geo_area)
        if price_trends:
            insights.append({
                "type": "price_trend",
                "title": "Tendencias de precios en tu área",
                "message": f"Los precios de {price_trends['category']} {price_trends['trend']} un {price_trends['percentage']}% esta semana",
                "confidence": price_trends["confidence"],
                "stores_sample_size": active_stores,
                "actionable": True,
                "priority": "medium"
            })
        
        # Insight de demanda por horario
        demand_patterns = await self._analyze_demand_patterns(db, geo_area)
        if demand_patterns:
            insights.append({
                "type": "demand_pattern",
                "title": "Patrones de demanda detectados",
                "message": f"Pico de ventas en {demand_patterns['category']} entre {demand_patterns['peak_hours']}",
                "actionable": True,
                "priority": "medium",
                "suggestion": f"Considera tener más stock disponible en ese horario"
            })
        
        return insights
    
    async def process_network_insights(self):
        """Procesa eventos de la red para generar insights"""
        db = next(get_db())
        
        try:
            # Obtener eventos no procesados
            unprocessed_events = db.query(NetworkEvent).filter(
                NetworkEvent.processed == False
            ).limit(100).all()
            
            for event in unprocessed_events:
                await self.analyze_network_event(event, db)
                event.processed = True
                
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    async def analyze_network_event(self, event: NetworkEvent, db: Session):
        """Analiza un evento específico de la red"""
        
        if event.event_type == "price_change":
            await self.detect_price_competition(event, db)
            
        elif event.event_type == "stock_out":
            await self.detect_cross_selling_opportunity(event, db)
            
        elif event.event_type == "high_demand":
            await self.alert_demand_spike(event, db)
    
    async def detect_price_competition(self, event: NetworkEvent, db: Session):
        """Detecta cambios de precios en la competencia"""
        
        # Buscar comercios cercanos con el mismo producto
        nearby_stores = db.execute(text("""
            SELECT s.id, s.name, p.price, p.name as product_name
            FROM stores s
            JOIN products p ON s.id = p.store_id
            WHERE p.id = :product_id
            AND s.id != :source_store_id
            AND s.category = (SELECT category FROM stores WHERE id = :source_store_id)
            ORDER BY s.created_at DESC
            LIMIT 5
        """), {
            "product_id": event.product_id,
            "source_store_id": event.source_store_id
        }).fetchall()
        
        if nearby_stores:
            source_store = db.query(Store).filter(Store.id == event.source_store_id).first()
            new_price = event.data.get("new_price")
            
            for store_data in nearby_stores:
                # Generar insight para cada comercio competidor
                insight = Insight(
                    store_id=store_data.id,
                    type="price_alert",
                    title="Competencia cambió precios",
                    message=f"{source_store.name} cambió el precio de {store_data.product_name} a ${new_price}. Tu precio actual: ${store_data.price}",
                    actionable=True,
                    priority="high" if abs(new_price - store_data.price) > store_data.price * 0.1 else "medium",
                    data={
                        "competitor_store": source_store.name,
                        "product_name": store_data.product_name,
                        "competitor_price": new_price,
                        "current_price": store_data.price,
                        "suggested_action": "consider_price_adjustment" if new_price < store_data.price else "monitor"
                    }
                )
                db.add(insight)
    
    async def detect_cross_selling_opportunity(self, event: NetworkEvent, db: Session):
        """Detecta oportunidades de venta cruzada cuando un comercio se queda sin stock"""
        
        # Buscar comercios cercanos que tengan el producto
        available_stores = db.execute(text("""
            SELECT s.id, s.name, s.phone, p.stock, p.price, p.name as product_name
            FROM stores s
            JOIN products p ON s.id = p.store_id
            WHERE p.name ILIKE (SELECT name FROM products WHERE id = :product_id)
            AND p.stock > 0
            AND s.id != :source_store_id
            AND s.category = (SELECT category FROM stores WHERE id = :source_store_id)
            ORDER BY p.stock DESC
            LIMIT 3
        """), {
            "product_id": event.product_id,
            "source_store_id": event.source_store_id
        }).fetchall()
        
        if available_stores:
            source_store = db.query(Store).filter(Store.id == event.source_store_id).first()
            
            for store_data in available_stores:
                insight = Insight(
                    store_id=store_data.id,
                    type="cross_sell_opportunity",
                    title="Oportunidad de venta",
                    message=f"{source_store.name} se quedó sin {store_data.product_name}. Tenés {store_data.stock} unidades. ¿Ofrecés entrega a sus clientes?",
                    actionable=True,
                    priority="high",
                    data={
                        "source_store": source_store.name,
                        "source_phone": source_store.phone,
                        "product_name": store_data.product_name,
                        "available_stock": store_data.stock,
                        "suggested_action": "contact_for_cross_sale"
                    }
                )
                db.add(insight)
    
    async def predict_stock_needs(self):
        """Predice necesidades de stock basado en patrones de venta"""
        db = next(get_db())
        
        try:
            # Obtener productos con baja rotación o cerca del stock mínimo
            low_stock_products = db.execute(text("""
                SELECT p.id, p.name, p.stock, p.min_stock, p.sales_velocity,
                       s.id as store_id, s.name as store_name
                FROM products p
                JOIN stores s ON p.store_id = s.id
                WHERE p.stock <= p.min_stock * 1.5
                AND p.is_active = true
                AND s.is_active = true
            """)).fetchall()
            
            for product in low_stock_products:
                # Calcular días de stock restante
                days_remaining = (product.stock / product.sales_velocity) if product.sales_velocity > 0 else 999
                
                priority = "critical" if days_remaining < 2 else "high" if days_remaining < 5 else "medium"
                
                insight = Insight(
                    store_id=product.store_id,
                    type="stock_prediction",
                    title="Alerta de stock",
                    message=f"{product.name} se agotará en {int(days_remaining)} días. Stock actual: {product.stock} unidades.",
                    actionable=True,
                    priority=priority,
                    data={
                        "product_id": product.id,
                        "product_name": product.name,
                        "current_stock": product.stock,
                        "days_remaining": days_remaining,
                        "suggested_order": int(product.min_stock * 2),
                        "sales_velocity": product.sales_velocity
                    }
                )
                db.add(insight)
                
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    async def detect_market_anomalies(self):
        """Detecta anomalías en patrones de mercado"""
        # TODO: Implementar detección de anomalías
        pass
    
    async def update_price_recommendations(self):
        """Actualiza recomendaciones de precios"""
        # TODO: Implementar recomendaciones de precios
        pass
    
    def _categorize_product(self, product_name: str) -> str:
        """Categoriza productos sin revelar nombres específicos"""
        categories = {
            "bebidas": ["coca", "pepsi", "agua", "cerveza", "vino", "jugo"],
            "lacteos": ["leche", "yogur", "queso", "manteca"],
            "panaderia": ["pan", "factura", "torta", "galleta"],
            "almacen": ["arroz", "aceite", "azucar", "sal", "fideos"],
            "limpieza": ["lavandina", "detergente", "jabon", "papel"],
            "cigarrillos": ["marlboro", "philip", "parlament"],
            "golosinas": ["chocolate", "caramelo", "chicle", "alfajor"]
        }
        
        product_lower = product_name.lower()
        for category, keywords in categories.items():
            if any(keyword in product_lower for keyword in keywords):
                return category
        
        return "otros"
    
    def _get_price_range(self, price: float) -> str:
        """Convierte precios exactos en rangos para preservar privacidad"""
        if price < 500:
            return "bajo"
        elif price < 2000:
            return "medio"
        elif price < 5000:
            return "alto"
        else:
            return "premium"
    
    def _get_quantity_range(self, quantity: int) -> str:
        """Convierte cantidades en rangos"""
        if quantity == 1:
            return "unitario"
        elif quantity <= 5:
            return "pequeño"
        elif quantity <= 20:
            return "mediano"
        else:
            return "mayorista"
    
    def _get_time_segment(self, timestamp: datetime) -> str:
        """Segmenta tiempo en franjas"""
        hour = timestamp.hour
        if 6 <= hour < 12:
            return "mañana"
        elif 12 <= hour < 18:
            return "tarde"
        elif 18 <= hour < 22:
            return "noche"
        else:
            return "madrugada"
    
    def _get_geo_segment(self, location: Dict) -> str:
        """Segmenta ubicación sin revelar direcciones exactas"""
        if not location or 'latitude' not in location:
            return "zona_desconocida"
            
        lat, lng = location["latitude"], location["longitude"]
        
        # Grid de 1km x 1km para agrupar comercios cercanos
        grid_lat = round(lat * 100) / 100  # Aproximadamente 1km
        grid_lng = round(lng * 100) / 100
        
        return f"zona_{grid_lat}_{grid_lng}"
    
    async def _count_active_stores(self, db: Session, geo_area: str) -> int:
        """Cuenta comercios activos en un área geográfica"""
        # TODO: Implementar conteo por área geográfica
        return db.query(Store).filter(Store.is_active == True).count()
    
    async def _analyze_price_trends(self, db: Session, geo_area: str) -> Optional[Dict]:
        """Analiza tendencias de precios en un área"""
        # TODO: Implementar análisis de tendencias
        return None
    
    async def _analyze_demand_patterns(self, db: Session, geo_area: str) -> Optional[Dict]:
        """Analiza patrones de demanda en un área"""
        # TODO: Implementar análisis de demanda
        return None
