from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    owner_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100))
    address = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    category = Column(String(50))  # almacen, farmacia, kiosco, etc.
    subscription_tier = Column(String(20), default="free")  # free, basic, premium
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Neural network data
    neural_profile = Column(JSON)  # Perfil de comportamiento para ML
    
    # Relationships
    products = relationship("Product", back_populates="store")
    sales = relationship("Sale", back_populates="store")
    insights = relationship("Insight", back_populates="store")
    users = relationship("User", back_populates="store")
    consent_settings = relationship("DataConsent", back_populates="store", uselist=False)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="owner")  # owner, employee
    permissions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    store = relationship("Store", back_populates="users")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    barcode = Column(String(50))
    price = Column(Float, nullable=False)
    cost = Column(Float)  # Precio de costo para calcular margen
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=5)  # Para alertas automáticas
    category = Column(String(50))
    brand = Column(String(100))
    supplier = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Neural insights data
    sales_velocity = Column(Float, default=0.0)  # Velocidad de venta calculada
    price_elasticity = Column(Float)  # Elasticidad precio-demanda
    seasonality_factor = Column(Float, default=1.0)
    
    # Relationships
    store = relationship("Store", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(50))  # cash, card, mercadopago, transfer
    customer_name = Column(String(100))
    customer_phone = Column(String(20))
    delivery_address = Column(String(200))
    delivery_status = Column(String(30), default="pending")  # pending, preparing, shipped, delivered
    delivery_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime)
    
    # WhatsApp integration
    whatsapp_message_id = Column(String(100))
    notification_sent = Column(Boolean, default=False)
    
    # Neural data
    predicted_delivery_time = Column(Integer)  # Minutos estimados
    customer_segment = Column(String(30))  # Segmento calculado por ML
    
    # Relationships
    store = relationship("Store", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sale_id = Column(String, ForeignKey("sales.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    type = Column(String(50), nullable=False)  # price_alert, stock_prediction, market_trend, etc.
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    actionable = Column(Boolean, default=True)
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    data = Column(JSON)  # Datos específicos del insight
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)
    acted_upon = Column(Boolean, default=False)
    
    # Relationships
    store = relationship("Store", back_populates="insights")

class NetworkEvent(Base):
    __tablename__ = "network_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(50), nullable=False)  # price_change, stock_out, new_product, etc.
    source_store_id = Column(String, ForeignKey("stores.id"))
    target_store_id = Column(String, ForeignKey("stores.id"))
    product_id = Column(String, ForeignKey("products.id"))
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)

class DataConsent(Base):
    __tablename__ = "data_consents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    
    # Consentimientos específicos
    sales_volume = Column(Boolean, default=True)
    time_patterns = Column(Boolean, default=True)
    product_categories = Column(Boolean, default=True)
    price_ranges = Column(Boolean, default=False)
    customer_segments = Column(Boolean, default=False)
    delivery_patterns = Column(Boolean, default=False)
    
    # Controles de privacidad (siempre True)
    opt_out_anytime = Column(Boolean, default=True)
    data_download = Column(Boolean, default=True)
    delete_request = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    store = relationship("Store", back_populates="consent_settings")

class AnonymizedData(Base):
    __tablename__ = "anonymized_data"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    anonymous_store_id = Column(String, nullable=False)  # Hash del store_id
    product_category = Column(String(50), nullable=False)
    price_range = Column(String(20))  # bajo, medio, alto, premium
    quantity_range = Column(String(20))
    time_segment = Column(String(20))  # morning, afternoon, evening, night
    geo_segment = Column(String(50))  # zona_lat_lng
    day_of_week = Column(Integer)
    is_weekend = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
