# Plataforma Institucional de Subsidencia - UNAM

Plataforma integral para el monitoreo geológico, estratigráfico y de subsidencia en el Valle de México. Permite visualizar, filtrar y analizar datos de pozos, fallas geológicas y generar perfiles de transectos estratigráficos interactivos.

## 🛠 Características Principales
*   **Mapa de Calor Estratigráfico**: Visualiza pozos geoespaciales coloreados por su profundidad máxima (Somera, Media, Profunda).
*   **Visor de Fallas**: Identificación en tiempo real de fracturas geológicas con nivel de riesgo.
*   **Análisis Dinámico de Transectos**: Herramienta de dibujo de perfiles (líneas) en el mapa que busca intersectar pozos dentro de un buffer paramétrico y generar diagramas de dispersión interactivos de la geología profunda.
*   **Menú Radial (HUD)**: Panel de control interactivo de usuario inspirado en herramientas CAD para activar y apagar capas al vuelo.

---

## 🚀 Requisitos del Sistema
- **Node.js**: v16+ (Para el frontend en React+Vite)
- **Conda** o **Python**: v3.9+ (Para el entorno virtual del backend Django)
- **Git**

---

## 💻 Instalación y Ejecución Local

### 1. Despliegue del Backend (Django)
El backend es responsable de despachar la información geográfica y matemática al mapa usando Django Rest Framework.

```bash
# Entrar al directorio
cd backend

# Crear y activar entorno conda si no está creado
conda create -n subsidencia python=3.10
conda activate subsidencia

# Instalar dependencias
pip install -r requirements.txt

# Aplicar las migraciones a la Base de Datos SQLite
python manage.py migrate

# Iniciar el servidor (correrá en http://127.0.0.1:8000)
python manage.py runserver
```

### 2. Despliegue del Frontend (React + Vite)
El frontend proporciona toda la interfaz interactiva con React-Leaflet y Tailwind CSS.

```bash
# En una nueva terminal, entrar al directorio
cd frontend

# Instalar los paquetes Node
npm install

# Levantar el entorno de desarrollo (correrá en http://localhost:5173)
npm run dev
```

---

## 🗄️ ¿Cómo cargar los datos a la Base de Datos?

El sistema cuenta con un script automatizado que lee todos los archivos brutos de litología (`.lth` y `.csv`) proporcionados por los estudios geotécnicos, y los inyecta en la base de datos de Django para que el frontend pueda consumirlos instantáneamente.

### Pasos para la importación:

1. Asegúrate de tener la carpeta fuente de datos `PLATAFORMA` ubicada en la raíz del proyecto. El script buscará específicamente los archivos de registro dentro de esta ruta relativa:
   `../PLATAFORMA/PLATAFORMA/well_data/raw_data/*.lth`

2. Abre una terminal de comandos.

3. Activa tu entorno virtual de conda:
   ```bash
   conda activate subsidencia
   ```

4. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```

5. Ejecuta el comando personalizado de importación:
   ```bash
   python manage.py importar_datos
   ```

### ¿Qué hace este script?
* Extrae las coordenadas **UTM (Zona 14N)** y elevaciones del pozo.
* Escanea cada una de las capas litológicas bajo esa perforación para guardarlas de manera relacional.
* Calcula variables geofísicas (Resistividad y Velocidad Sísmica).
* Note: El backend (*serializers.py*) se encarga de convertir automáticamente en "tiempo real" estas coordenadas UTM a grados Geográficos (WGS84) que el mapa Web entiende.

---

## 🖌️ Estructura del Proyecto

* `/backend` : Contiene el servidor de API en Django.
    * `/core` : La aplicación principal (modelos de `Pozo`, `Litologia`, manejo de rutas).
* `/frontend` : Contiene la arquitectura SPA (React).
    * `/src/pages/PublicMap.jsx` : Controlador principal del mapa y la gestión de capas.
    * `/src/components/` : Menú Radial HUD, Modales y Componentes Institucionales de interfaz.

---

> Desarrollado para visualización e investigación de deformación terrestre y geotecnia.
