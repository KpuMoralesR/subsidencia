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

# Activar el entorno de Anaconda
conda activate subsidencia

# Instalar dependencias si es necesario
pip install -r requirements.txt

# Aplicar las migraciones a la Base de Datos PostgreSQL
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

## 🗄️ ¿Cómo cargar o actualizar datos?

El sistema utiliza una base de datos **PostgreSQL** (con soporte para PostGIS) para almacenar todos los pozos y capas litológicas. Esto permite que el análisis de transectos sea instantáneo y escalable.

### Pasos para la importación:

1. **Preparar archivos**: Asegúrate de tener los archivos `.lth` listos. 
2. **Activar el entorno**:
   ```bash
   conda activate subsidencia
   cd backend
   ```
3. **Ejecutar el comando de importación**:
   * Para un solo archivo:
     ```bash
     python manage.py importar_datos ruta/al/archivo.lth
     ```
   * Para una carpeta completa con múltiples archivos:
     ```bash
     python manage.py importar_datos ruta/a/la/carpeta/
     ```

### ¿Qué hace este script?
* **Sincronización Total**: Lee las coordenadas Lat/Lon y las convierte a UTM para cálculos geométricos precisos.
* **Limpieza Automática**: Al importar un archivo, el script reemplaza cualquier versión previa de ese pozo para evitar duplicados.
* **Normalización**: Convierte nulos de archivos brutos a formatos compatibles con JSON para evitar errores en la web.
* **Centralización**: Una vez importados, el sistema deja de depender de archivos físicos y utiliza únicamente la Base de Datos para mayor velocidad.

---

## 🖌️ Estructura del Proyecto

* `/backend` : Contiene el servidor de API en Django.
    * `/core` : La aplicación principal (modelos de `Pozo`, `Litologia`, manejo de rutas).
* `/frontend` : Contiene la arquitectura SPA (React).
    * `/src/pages/PublicMap.jsx` : Controlador principal del mapa y la gestión de capas.
    * `/src/components/` : Menú Radial HUD, Modales y Componentes Institucionales de interfaz.

---

> Desarrollado para visualización e investigación de deformación terrestre y geotecnia.
