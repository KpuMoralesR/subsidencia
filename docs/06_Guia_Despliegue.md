# 06. Guía de Despliegue

## Requisitos Previos
- Python 3.9+
- Node.js 16+ (Recomendado 20+ si se actualiza Vite)
- PostgreSQL 12+

## Instalación Local

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Despliegue en Producción (Recomendado)
- Usar **Gunicorn** como servidor de aplicaciones Django.
- Usar **Nginx** como proxy inverso y para servir estáticos.
- Configurar `DEBUG=False` en `settings.py`.
- Generar build de React: `npm run build` y servir la carpeta `dist/`.
