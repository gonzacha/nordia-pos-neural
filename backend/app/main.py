from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import asyncio
from typing import Optional

from .core.database import get_db, engine, Base
from .core.auth import verify_token
from .neural.engine import NeuralEngine
from .integrations.whatsapp import WhatsAppService
from .integrations.mercadopago import MercadoPagoService
from .routers import pos, insights, products, sales, analytics, auth, consent

# Initialize neural engine
neural_engine = NeuralEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    await neural_engine.initialize()
    print("🧠 Nordia Neural Engine initialized")
    yield
    # Shutdown
    await neural_engine.cleanup()
    print("🧠 Nordia Neural Engine cleaned up")

app = FastAPI(
    title="Nordia Neural API",
    description="API para la red neural comercial de PyMEs",
    version="1.0.0",
    lifespan=lifespan
)

# CORS para PWA
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nordia.app", 
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = await verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# Include routers
app.include_router(auth.router)
app.include_router(pos.router)
app.include_router(insights.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(analytics.router)
app.include_router(consent.router)

@app.get("/")
async def root():
    return {
        "message": "Nordia Neural Network API", 
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "neural_engine": neural_engine.is_healthy(),
        "database": "connected",
        "version": "1.0.0",
        "services": {
            "whatsapp": True,  # TODO: Check WhatsApp API status
            "mercadopago": True,  # TODO: Check MercadoPago API status
            "neural_processing": neural_engine.is_running
        }
    }

@app.post("/api/webhook/whatsapp")
async def whatsapp_webhook(data: dict, background_tasks: BackgroundTasks):
    """
    Webhook para recibir mensajes de WhatsApp Business
    """
    whatsapp_service = WhatsAppService()
    background_tasks.add_task(whatsapp_service.handle_incoming_message, data)
    return {"status": "received"}

@app.get("/api/webhook/whatsapp")
async def whatsapp_webhook_verify(
    hub_mode: str = None,
    hub_verify_token: str = None,
    hub_challenge: str = None
):
    """
    Verificación del webhook de WhatsApp
    """
    VERIFY_TOKEN = "nordia_whatsapp_verify_token_2025"
    
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    else:
        raise HTTPException(status_code=403, detail="Forbidden")
