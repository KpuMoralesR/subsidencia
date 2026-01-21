# Guía de Desarrollo: Creación de Nuevos Módulos

## Introducción
Esta guía documenta el proceso completo para añadir nuevos módulos funcionales al sistema BaseDR. Utilizaremos el módulo "Hola Mundo" como ejemplo de referencia.

## Arquitectura de un Módulo
Un módulo completo en BaseDR consta de tres capas:

1. **Base de Datos**: Registro del módulo para el sistema RBAC
2. **Backend (API)**: Endpoint que procesa la lógica de negocio
3. **Frontend (UI)**: Interfaz de usuario que consume el API

---

## Paso 1: Crear el Registro del Módulo (Base de Datos)

### Objetivo
Registrar el nuevo módulo en la base de datos para que el sistema de permisos lo reconozca.

### Herramienta
Utiliza el script `backend/create_module.py` que acepta parámetros por línea de comandos.

### Comando
```bash
python backend/create_module.py --code HELLO --name "Hola Mundo" --desc "Módulo de prueba API"
```

### Parámetros
- `--code`: Código único del módulo (MAYÚSCULAS, ej. `HELLO`, `REPORTS`)
- `--name`: Nombre visible del módulo
- `--desc`: Descripción opcional

### Resultado Esperado
```
✅ Módulo 'Hola Mundo' (HELLO) creado exitosamente.
✅ Módulo asignado al rol 'Superadmin'.
```

> [!IMPORTANT]
> El código del módulo **DEBE estar en MAYÚSCULAS** para mantener consistencia con el sistema RBAC.

---

## Paso 2: Crear el Endpoint Backend (API)

### 2.1. Definir la Vista

**Archivo**: `backend/core/views.py`

Añade una nueva clase de vista al final del archivo:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import HasModuleAccess

class HelloView(APIView):
    permission_classes = [HasModuleAccess]
    required_module_code = 'HELLO'  # Debe coincidir con el código en BD

    def get(self, request):
        return Response({"message": "Hola desde el Backend BaseDR!"})
```

#### Opciones de Vista

**APIView** (Simple, para endpoints únicos):
```python
class MiView(APIView):
    permission_classes = [HasModuleAccess]
    required_module_code = 'MI_MODULO'
    
    def get(self, request):
        return Response({"data": "..."})
    
    def post(self, request):
        return Response({"status": "created"})
```

**ModelViewSet** (CRUD completo):
```python
class MiViewSet(viewsets.ModelViewSet):
    queryset = MiModelo.objects.all()
    serializer_class = MiSerializer
    permission_classes = [HasModuleAccess]
    required_module_code = 'MI_MODULO'
```

### 2.2. Registrar la Ruta

**Archivo**: `backend/core/urls.py`

#### Para APIView:
```python
from .views import HelloView

urlpatterns = [
    path('', include(router.urls)),
    path('hello/', HelloView.as_view(), name='hello'),
]
```

#### Para ViewSet:
```python
from .views import MiViewSet

router.register(r'mi-recurso', MiViewSet)
```

> [!WARNING]
> **APIView** usa `path()` con `.as_view()`.  
> **ViewSet** usa `router.register()`.  
> No mezcles estos métodos o Django lanzará errores.

---

## Paso 3: Crear la Interfaz Frontend (UI)

### 3.1. Crear el Componente de Página

**Archivo**: `frontend/src/pages/Hello.jsx`

```javascript
import { useEffect, useState } from 'react';
import api from '../context/AuthContext';

const Hello = () => {
    const [message, setMessage] = useState('Cargando...');

    useEffect(() => {
        api.get('/hello/')
            .then(res => setMessage(res.data.message))
            .catch(err => setMessage('Error al cargar mensaje.'));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Módulo de Prueba</h1>
            <div className="p-4 bg-white rounded shadow">
                <p className="text-lg text-gray-700">{message}</p>
            </div>
        </div>
    );
};

export default Hello;
```

#### Patrón Recomendado
- **useState**: Para manejar el estado de los datos
- **useEffect**: Para cargar datos al montar el componente
- **api.get/post**: Cliente axios configurado con autenticación JWT

### 3.2. Registrar la Ruta

**Archivo**: `frontend/src/App.jsx`

```javascript
import Hello from './pages/Hello';

// Dentro del componente App, en las rutas protegidas:
<Route path="/dashboard" element={<ProtectedRoute />}>
    <Route index element={<Dashboard />} />
    <Route path="/users" element={<Users />} />
    {/* ... otras rutas ... */}
    <Route path="/hello" element={<Hello />} />
</Route>
```

### 3.3. Añadir al Menú Lateral

**Archivo**: `frontend/src/components/layout/Sidebar.jsx`

```javascript
import { Hand } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', code: 'DASHBOARD' },
    // ... otros items ...
    { name: 'Hola', icon: Hand, path: '/hello', code: 'HELLO' },
];
```

#### Propiedades del Item
- `name`: Texto visible en el menú
- `icon`: Componente de icono de `lucide-react`
- `path`: Ruta de navegación (debe coincidir con App.jsx)
- `code`: Código del módulo (RBAC automático)

> [!NOTE]
> El sidebar filtra automáticamente los items según los permisos del usuario. Si el usuario no tiene el módulo `HELLO`, el item no se mostrará.

---

## Paso 4: Verificación

### 4.1. Backend
Prueba el endpoint con curl o Postman:

```bash
# Obtener token
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.access')

# Probar endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/hello/
```

**Respuesta esperada**:
```json
{"message": "Hola desde el Backend BaseDR!"}
```

### 4.2. Frontend
1. Inicia sesión como `admin`
2. Verifica que aparece "Hola" en el sidebar
3. Haz clic en el item
4. Verifica que se muestra el mensaje del backend

### 4.3. RBAC
1. Crea un usuario sin el módulo `HELLO`
2. Inicia sesión con ese usuario
3. Verifica que **NO** aparece "Hola" en el sidebar

---

## Checklist de Creación de Módulo

- [ ] **Base de Datos**
  - [ ] Ejecutar `create_module.py` con código en MAYÚSCULAS
  - [ ] Verificar que el módulo se asignó a Superadmin
  
- [ ] **Backend**
  - [ ] Crear vista en `views.py` con `HasModuleAccess`
  - [ ] Definir `required_module_code` (MAYÚSCULAS)
  - [ ] Registrar ruta en `urls.py` (path o router según tipo)
  - [ ] Importar `APIView` si es necesario
  
- [ ] **Frontend**
  - [ ] Crear componente en `src/pages/`
  - [ ] Usar `api.get()` para consumir endpoint
  - [ ] Registrar ruta en `App.jsx`
  - [ ] Añadir item al sidebar con código correcto
  - [ ] Importar icono de `lucide-react`
  
- [ ] **Verificación**
  - [ ] Probar endpoint con token JWT
  - [ ] Verificar UI como admin
  - [ ] Verificar RBAC con usuario limitado

---

## Errores Comunes

### `NameError: name 'APIView' is not defined`
**Causa**: Falta import en `views.py`  
**Solución**: Añadir `from rest_framework.views import APIView`

### `'HelloView' object has no attribute 'get_queryset'`
**Causa**: Intentaste usar `router.register()` con una `APIView`  
**Solución**: Usa `path('hello/', HelloView.as_view())` en su lugar

### Error 403 Forbidden
**Causa**: Discrepancia de mayúsculas/minúsculas en código de módulo  
**Solución**: Verifica que `required_module_code` coincida exactamente con el código en BD (MAYÚSCULAS)

### El item no aparece en el sidebar
**Causa**: El usuario no tiene el módulo asignado  
**Solución**: Asigna el módulo al rol del usuario desde la UI de Roles

---

## Ejemplo Completo: Módulo de Reportes

### 1. Base de Datos
```bash
python backend/create_module.py --code REPORTS --name "Reportes" --desc "Generación de reportes del sistema"
```

### 2. Backend
```python
# views.py
class ReportView(APIView):
    permission_classes = [HasModuleAccess]
    required_module_code = 'REPORTS'
    
    def get(self, request):
        # Lógica de generación de reportes
        return Response({"reports": [...]})

# urls.py
path('reports/', ReportView.as_view(), name='reports'),
```

### 3. Frontend
```javascript
// src/pages/Reports.jsx
import { FileBarChart } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    
    useEffect(() => {
        api.get('/reports/').then(res => setReports(res.data.reports));
    }, []);
    
    return <div>{/* UI de reportes */}</div>;
};

// App.jsx
<Route path="/reports" element={<Reports />} />

// Sidebar.jsx
{ name: 'Reportes', icon: FileBarChart, path: '/reports', code: 'REPORTS' }
```

---

## Recursos Adicionales

- **Iconos**: [Lucide React Icons](https://lucide.dev/icons/)
- **Django REST Framework**: [Documentación Oficial](https://www.django-rest-framework.org/)
- **React Hooks**: [useEffect](https://react.dev/reference/react/useEffect)
