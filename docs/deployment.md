# Instalación y Deploy de Nordia POS

## Configuración Local de Desarrollo

### Requisitos Previos
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Setup Rápido con Docker

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd nordia-pos
```

2. **Configurar variables de entorno:**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales
```

3. **Levantar todos los servicios:**
```bash
docker-compose up -d
```

4. **Verificar que funciona:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Docs API: http://localhost:8000/docs

### Setup Manual (Desarrollo)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configurar .env con tu base de datos local
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Configurar .env.local
npm run dev
```

## Deploy a Producción en Google Cloud Platform

### 1. Preparación del Proyecto GCP

```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Crear proyecto
gcloud projects create nordia-pos-prod
gcloud config set project nordia-pos-prod

# Habilitar servicios necesarios
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Base de Datos Cloud SQL

```bash
# Crear instancia PostgreSQL
gcloud sql instances create nordia-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=southamerica-east1

# Crear base de datos
gcloud sql databases create nordia --instance=nordia-db

# Crear usuario
gcloud sql users create nordiauser \
  --instance=nordia-db \
  --password=your_secure_password
```

### 3. Redis Memorystore

```bash
# Crear instancia Redis
gcloud redis instances create nordia-redis \
  --size=1 \
  --region=southamerica-east1 \
  --redis-version=redis_7_0
```

### 4. Secrets Manager

```bash
# Crear secrets para variables sensibles
echo "your_whatsapp_token" | gcloud secrets create whatsapp-token --data-file=-
echo "your_mercadopago_token" | gcloud secrets create mercadopago-token --data-file=-
echo "your_jwt_secret" | gcloud secrets create jwt-secret --data-file=-
```

### 5. Deploy Backend en Cloud Run

```bash
# Build y push de imagen
gcloud builds submit backend/ --tag gcr.io/nordia-pos-prod/backend

# Deploy a Cloud Run
gcloud run deploy nordia-backend \
  --image gcr.io/nordia-pos-prod/backend \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://nordiauser:password@/nordia?host=/cloudsql/nordia-pos-prod:southamerica-east1:nordia-db" \
  --add-cloudsql-instances nordia-pos-prod:southamerica-east1:nordia-db
```

### 6. Deploy Frontend

```bash
# Build optimizado
cd frontend
npm run build

# Subir a Cloud Storage + CDN
gsutil mb gs://nordia-pos-frontend
gsutil -m cp -r dist/* gs://nordia-pos-frontend
gsutil web set -m index.html -e index.html gs://nordia-pos-frontend

# Configurar Load Balancer + SSL
gcloud compute url-maps create nordia-lb \
  --default-backend-bucket=nordia-pos-frontend
```

### 7. Configuración de Dominio y SSL

```bash
# Reservar IP estática
gcloud compute addresses create nordia-ip --global

# Configurar certificado SSL (Let's Encrypt)
gcloud compute ssl-certificates create nordia-ssl \
  --domains=nordia.app,api.nordia.app
```

## Configuración de Webhooks

### WhatsApp Business

```bash
# Configurar webhook URL en Meta Developer Console
WEBHOOK_URL="https://api.nordia.app/api/webhook/whatsapp"
VERIFY_TOKEN="nordia_whatsapp_verify_token_2025"
```

### MercadoPago

```bash
# Configurar webhook para notificaciones de pago
curl -X POST \
  https://api.mercadopago.com/v1/webhooks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.nordia.app/api/webhook/mercadopago",
    "events": ["payment"]
  }'
```

## Monitoreo y Logs

### Cloud Logging
```bash
# Ver logs del backend
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=nordia-backend"

# Ver logs de errores
gcloud logs read "resource.type=cloud_run_revision AND severity>=ERROR"
```

### Métricas de Performance
```bash
# Configurar alertas
gcloud alpha monitoring policies create --policy-from-file=monitoring/alerts.yaml
```

## Backup y Recuperación

### Backup Automático de Base de Datos
```bash
# Configurar backup diario
gcloud sql backups create --instance=nordia-db --description="Daily backup"

# Programar backup automático
gcloud scheduler jobs create http backup-nordia-db \
  --schedule="0 3 * * *" \
  --uri="https://sqladmin.googleapis.com/sql/v1beta4/projects/nordia-pos-prod/instances/nordia-db/backupRuns" \
  --http-method=POST
```

## Scaling y Performance

### Auto-scaling Backend
```bash
# Configurar auto-scaling en Cloud Run
gcloud run services update nordia-backend \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=100
```

### CDN para Frontend
```bash
# Configurar Cloud CDN
gcloud compute backend-buckets create frontend-bucket \
  --gcs-bucket-name=nordia-pos-frontend

gcloud compute url-maps add-path-matcher nordia-lb \
  --path-matcher-name=frontend \
  --default-backend-bucket=frontend-bucket
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos:**
```bash
# Verificar conectividad
gcloud sql connect nordia-db --user=nordiauser
```

2. **WhatsApp webhook no responde:**
```bash
# Verificar logs
gcloud logs read "resource.type=cloud_run_revision AND textPayload:whatsapp"
```

3. **Frontend no carga:**
```bash
# Verificar bucket público
gsutil iam get gs://nordia-pos-frontend
```

### Comandos de Diagnóstico

```bash
# Estado de servicios
gcloud run services list
gcloud sql instances list
gcloud redis instances list

# Métricas en tiempo real
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"
```

## Actualizaciones

### Deploy de Nueva Versión

```bash
# Backend
gcloud builds submit backend/ --tag gcr.io/nordia-pos-prod/backend:v1.1.0
gcloud run deploy nordia-backend --image gcr.io/nordia-pos-prod/backend:v1.1.0

# Frontend
npm run build
gsutil -m rsync -r -d dist/ gs://nordia-pos-frontend/
```

### Rollback

```bash
# Rollback a versión anterior
gcloud run services update-traffic nordia-backend --to-revisions=PREVIOUS=100
```

## Costos Estimados (USD/mes)

- Cloud Run (Backend): $20-50
- Cloud SQL (db-f1-micro): $10-15
- Memorystore Redis (1GB): $25
- Cloud Storage + CDN: $5-10
- Load Balancer: $18
- **Total estimado: $78-118/mes**

Para ambiente de producción con más tráfico, considerar:
- Cloud SQL db-n1-standard-1: $50/mes
- Redis 5GB: $125/mes
- Total production: $200-300/mes
