# NORDIA POS - Red Neural Comercial para PyMEs

## Descripción del Proyecto

Nordia POS es una PWA (Progressive Web App) que convierte PyMEs en nodos de una red neural comercial. A cambio de un POS móvil gratuito, los comercios comparten datos anónimos que se transforman en inteligencia colectiva.

## Arquitectura

```
nordia-pos/
├── frontend/          # PWA React + TypeScript
├── backend/           # FastAPI + PostgreSQL + Redis
├── docker/            # Configuración de contenedores
├── docs/              # Documentación técnica
└── marketing/         # Materiales de marketing y landing
```

## Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- PWA con Service Workers
- Material-UI para componentes
- IndexedDB para almacenamiento offline

**Backend:**
- FastAPI (Python 3.11)
- PostgreSQL + SQLAlchemy
- Redis para cache y tareas
- Celery para procesamiento asíncrono

**Integrations:**
- WhatsApp Business API
- MercadoPago SDK
- Google Maps API
- AFIP WebServices

## Instalación y Deploy

### Requisitos Previos
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Cuenta en Google Cloud Platform

### Setup Local

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd nordia-pos
```

2. **Setup Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

3. **Setup Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python -m app.main
```

4. **Docker Compose (Recomendado):**
```bash
docker-compose up -d
```

### Deploy a Producción

Consultar `docs/deployment.md` para instrucciones detalladas de deploy en Google Cloud Platform.

## Características Principales

- **POS Offline-First**: Funciona sin internet, sincroniza automáticamente
- **Neural Engine**: Genera insights basados en datos agregados
- **Transparencia Total**: Dashboard donde comercios ven qué datos comparten
- **WhatsApp Integration**: Notificaciones automáticas de delivery
- **Sistema de Consentimiento**: Control granular sobre privacidad de datos

## Desarrollo

### Frontend
```bash
cd frontend
npm run dev      # Desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

### Backend
```bash
cd backend
uvicorn app.main:app --reload  # Desarrollo
```

### Testing
```bash
# Frontend
npm run test

# Backend
pytest
```

## Licencia

Propietario - Nordia Technologies 2025

## Contacto

Para más información sobre el proyecto, contactar a través de [correo].
