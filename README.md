# 🚀 BaseDR - Django + React Secure Base

**BaseDR** es una plataforma base empresarial robusta y segura, diseñada como punto de partida para aplicaciones web modernas que requieren autenticación, gestión de usuarios y control de acceso basado en roles (RBAC).

---

## 📋 Descripción

BaseDR proporciona una arquitectura completa y lista para producción que combina:

- **Backend robusto** con Django REST Framework
- **Frontend moderno** con React y TailwindCSS
- **Autenticación segura** mediante JWT
- **Control de acceso granular** basado en roles y módulos
- **Base de datos PostgreSQL** para máxima confiabilidad
- **Documentación profesional** completa

---

## 🏗️ Arquitectura

### Stack Tecnológico

#### Backend
- **Django 5.2** - Framework web Python
- **Django REST Framework** - API RESTful
- **Simple JWT** - Autenticación con tokens JWT
- **PostgreSQL** - Base de datos relacional
- **CORS Headers** - Manejo de peticiones cross-origin

#### Frontend
- **React 19** - Biblioteca UI moderna
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconos modernos

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Login seguro con JWT tokens
- Refresh tokens para sesiones persistentes
- Rutas protegidas en frontend y backend
- Logout con limpieza de tokens

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles
- Perfiles de usuario
- Validación de permisos

### 🎭 Sistema de Roles y Permisos
- Roles dinámicos configurables
- Asignación de módulos a roles
- Control de acceso granular (RBAC)
- Permisos a nivel de módulo

### 📊 Dashboard Administrativo
- Interfaz moderna y responsiva
- Sidebar con navegación dinámica
- Navbar con información de usuario
- Acceso basado en permisos

### 🎨 Diseño Premium
- Interfaz moderna con TailwindCSS
- Animaciones suaves con Framer Motion
- Diseño responsivo
- Experiencia de usuario optimizada

---

## 📁 Estructura del Proyecto

```
basedr/
├── backend/                    # Django Backend
│   ├── config/                # Configuración del proyecto
│   │   ├── settings.py       # Configuración principal
│   │   ├── urls.py           # URLs principales
│   │   └── wsgi.py           # WSGI application
│   ├── core/                  # App principal
│   │   ├── models.py         # Modelos (User, Role, Module)
│   │   ├── views.py          # Vistas y endpoints
│   │   ├── serializers.py    # Serializadores DRF
│   │   ├── permissions.py    # Permisos personalizados
│   │   └── admin.py          # Configuración admin
│   ├── manage.py             # Comando Django
│   ├── requirements.txt      # Dependencias Python
│   └── venv/                 # Entorno virtual
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/          # Context API
│   │   │   └── AuthContext.jsx
│   │   ├── pages/            # Páginas/Vistas
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Roles.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Hello.jsx
│   │   ├── services/         # Servicios API
│   │   │   └── api.js
│   │   ├── App.jsx           # Componente principal
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Estilos globales
│   ├── package.json          # Dependencias Node
│   ├── vite.config.js        # Configuración Vite
│   └── tailwind.config.js    # Configuración Tailwind
│
├── docs/                      # Documentación profesional
│   ├── 01_SRS.md             # Especificación de requisitos
│   ├── 02_Documentacion_Funcional.md
│   ├── 03_Manual_Usuario.md
│   ├── 04_Manual_Operacion.md
│   ├── 05_Seguridad.md
│   ├── 06_Guia_Despliegue.md
│   ├── 07_Entrega_y_Versionado.md
│   ├── 08_Guia_Desarrollo_Modulos.md
│   ├── Security.md           # Análisis de seguridad
│   ├── Threat_Model.md       # Modelo de amenazas
│   ├── Matriz_Riesgos.md     # Matriz de riesgos
│   ├── Checklist_OWASP.md    # Checklist OWASP
│   ├── capturas/             # Capturas de pantalla
│   └── pdf/                  # Documentación en PDF
│
├── .env                       # Variables de entorno (NO versionar)
├── .env.example              # Plantilla de variables
├── .gitignore                # Archivos ignorados por Git
├── .gitlab-ci.yml            # CI/CD GitLab
└── README.md                 # Este archivo
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Python 3.11+**
- **Node.js 18+** y npm
- **PostgreSQL 12+**
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://gitlab.centrogeo.edu.mx/u.morales/basedr.git
cd basedr
```

### 2. Configurar Backend

#### 2.1 Crear entorno virtual

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

#### 2.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 2.3 Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp ../.env.example ../.env

# Editar .env con tus credenciales
nano ../.env
```

**Variables importantes a configurar:**
- `SECRET_KEY` - Generar una nueva clave secreta
- `DB_NAME` - Nombre de tu base de datos
- `DB_USER` - Usuario de PostgreSQL
- `DB_PASSWORD` - Contraseña de PostgreSQL
- `DEBUG` - False en producción

#### 2.4 Crear base de datos PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE base;

# Salir
\q
```

#### 2.5 Ejecutar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 2.6 Crear superusuario

```bash
python manage.py createsuperuser
```

#### 2.7 Cargar datos iniciales (opcional)

```bash
python manage.py loaddata initial_data.json
```

### 3. Configurar Frontend

#### 3.1 Instalar dependencias

```bash
cd ../frontend
npm install
```

#### 3.2 Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar si es necesario
nano .env
```

---

## 🎯 Uso

### Desarrollo

#### Iniciar Backend

```bash
cd backend
source venv/bin/activate  # En Windows: venv\Scripts\activate
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

#### Iniciar Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### Producción

#### Backend

```bash
# Configurar variables de entorno para producción
export DEBUG=False
export ALLOWED_HOSTS=tu-dominio.com

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Usar servidor WSGI (Gunicorn, uWSGI, etc.)
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend

```bash
# Build de producción
npm run build

# Los archivos estarán en dist/
# Servir con nginx, apache, etc.
```

---

## 🔑 Credenciales por Defecto

### Superusuario
- **Usuario:** (definido al crear superusuario)
- **Contraseña:** (definida al crear superusuario)

### Base de Datos
- **Nombre:** base
- **Usuario:** postgres
- **Contraseña:** postgres (cambiar en producción)
- **Host:** localhost
- **Puerto:** 5432

---

## 📚 Endpoints API

### Autenticación

```
POST   /api/token/          # Obtener tokens (login)
POST   /api/token/refresh/  # Refrescar access token
POST   /api/logout/         # Cerrar sesión
```

### Usuarios

```
GET    /api/users/          # Listar usuarios
POST   /api/users/          # Crear usuario
GET    /api/users/{id}/     # Obtener usuario
PUT    /api/users/{id}/     # Actualizar usuario
DELETE /api/users/{id}/     # Eliminar usuario
GET    /api/users/me/       # Obtener usuario actual
```

### Roles

```
GET    /api/roles/          # Listar roles
POST   /api/roles/          # Crear rol
GET    /api/roles/{id}/     # Obtener rol
PUT    /api/roles/{id}/     # Actualizar rol
DELETE /api/roles/{id}/     # Eliminar rol
```

### Módulos

```
GET    /api/modules/        # Listar módulos disponibles
```

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

✅ **Autenticación JWT** - Tokens seguros con expiración  
✅ **Contraseñas hasheadas** - PBKDF2 con salt  
✅ **CORS configurado** - Orígenes permitidos controlados  
✅ **CSRF Protection** - Tokens CSRF en formularios  
✅ **SQL Injection Protection** - ORM Django  
✅ **XSS Protection** - Sanitización automática  
✅ **RBAC** - Control de acceso basado en roles  
✅ **HTTPS Ready** - Configuración para SSL/TLS  
✅ **Variables de entorno** - Credenciales fuera del código  

### Recomendaciones para Producción

- [ ] Cambiar `SECRET_KEY` por una clave única y segura
- [ ] Configurar `DEBUG=False`
- [ ] Configurar `ALLOWED_HOSTS` correctamente
- [ ] Usar HTTPS (SSL/TLS)
- [ ] Configurar firewall
- [ ] Implementar rate limiting
- [ ] Configurar backups automáticos
- [ ] Monitoreo y logging
- [ ] Actualizar dependencias regularmente

---

## 📖 Documentación

La documentación completa del proyecto se encuentra en la carpeta `/docs`:

- **01_SRS.md** - Especificación de Requisitos del Sistema
- **02_Documentacion_Funcional.md** - Documentación funcional
- **03_Manual_Usuario.md** - Manual de usuario
- **04_Manual_Operacion.md** - Manual de operación
- **05_Seguridad.md** - Análisis de seguridad
- **06_Guia_Despliegue.md** - Guía de despliegue
- **07_Entrega_y_Versionado.md** - Control de versiones
- **08_Guia_Desarrollo_Modulos.md** - Guía para desarrolladores

---

## 🛠️ Desarrollo

### Agregar Nuevos Módulos

Para agregar nuevos módulos al sistema, consulta la guía:
`docs/08_Guia_Desarrollo_Modulos.md`

### Ejecutar Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y pertenece a CentroGeo.

---

## 👥 Autores

- **Ulises Morales** - [u.morales@centrogeo.edu.mx](mailto:u.morales@centrogeo.edu.mx)

---

## 📞 Soporte

Para soporte y preguntas:
- Email: u.morales@centrogeo.edu.mx
- GitLab Issues: https://gitlab.centrogeo.edu.mx/u.morales/basedr/-/issues

---

## 🗺️ Roadmap

- [x] Sistema de autenticación JWT
- [x] Gestión de usuarios y roles
- [x] Dashboard con RBAC
- [x] Documentación completa
- [ ] Tests unitarios completos
- [ ] Tests de integración
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoreo y logging
- [ ] API documentation (Swagger/OpenAPI)

---

## 📊 Estado del Proyecto

**Versión:** 1.0.0  
**Estado:** En Desarrollo Activo  
**Última Actualización:** 21/01/2026

---

**BaseDR** - Base empresarial segura para aplicaciones Django + React 🚀
