# Guía de Desarrollo: Creación de Nuevos Módulos

**Proyecto:** BaseDR  
**Versión:** 1.0.0  
**Fecha:** 21/01/2026

---

## 📋 Introducción

Esta guía documenta el proceso completo para añadir nuevos módulos funcionales al sistema BaseDR. El sistema utiliza **ViewSets de Django REST Framework** para implementar operaciones CRUD de forma eficiente y consistente.

### Arquitectura de un Módulo

Un módulo completo en BaseDR consta de **cuatro capas**:

1. **Base de Datos**: Registro del módulo para el sistema RBAC
2. **Modelo**: Definición de la estructura de datos (si aplica)
3. **Backend (API)**: ViewSet que implementa la lógica de negocio
4. **Frontend (UI)**: Interfaz de usuario que consume el API

---

## 🎓 Entendiendo los Endpoints - Explicación para Principiantes

### ¿Qué es un Endpoint?

Un **endpoint** es como una "dirección web" a la que tu aplicación puede enviar peticiones para hacer cosas. Es como tocar diferentes botones en un control remoto: cada botón hace algo diferente.

### Ejemplo Práctico: Sistema de Productos

Imagina que tienes una tienda y quieres gestionar tus productos (laptops, celulares, etc.). Necesitas poder:
- 📋 Ver todos tus productos
- ➕ Agregar un producto nuevo
- 👁️ Ver los detalles de un producto específico
- ✏️ Modificar un producto
- 🗑️ Eliminar un producto

### Los 5 Endpoints Básicos (CRUD)

Cuando creas un **ProductoViewSet**, automáticamente obtienes estos 5 endpoints:

#### 1️⃣ **Listar Todos** - `GET /api/productos/`
```
¿Qué hace? → Muestra TODOS los productos de tu tienda
¿Cuándo usarlo? → Cuando quieres ver la lista completa

Ejemplo en la vida real:
- Entras a tu tienda y quieres ver TODO lo que tienes en inventario

Respuesta que recibes:
[
  {"id": 1, "nombre": "Laptop Dell", "precio": 15000, "stock": 5},
  {"id": 2, "nombre": "iPhone 15", "precio": 20000, "stock": 3},
  {"id": 3, "nombre": "Mouse Logitech", "precio": 500, "stock": 20}
]
```

#### 2️⃣ **Crear Nuevo** - `POST /api/productos/`
```
¿Qué hace? → Agrega UN producto nuevo a tu tienda
¿Cuándo usarlo? → Cuando compras mercancía nueva y quieres registrarla

Ejemplo en la vida real:
- Compraste 10 teclados nuevos y quieres agregarlos al sistema

Lo que envías:
{
  "nombre": "Teclado Mecánico",
  "precio": 1200,
  "stock": 10
}

Respuesta que recibes:
{
  "id": 4,  ← El sistema le asigna un ID automáticamente
  "nombre": "Teclado Mecánico",
  "precio": 1200,
  "stock": 10
}
```

#### 3️⃣ **Ver Uno Específico** - `GET /api/productos/2/`
```
¿Qué hace? → Muestra los detalles de UN producto específico
¿Cuándo usarlo? → Cuando quieres ver la información completa de un producto

Ejemplo en la vida real:
- Un cliente pregunta por el iPhone 15 (que tiene ID 2)

Respuesta que recibes:
{
  "id": 2,
  "nombre": "iPhone 15",
  "descripcion": "Smartphone última generación",
  "precio": 20000,
  "stock": 3,
  "activo": true
}
```

#### 4️⃣ **Actualizar** - `PUT /api/productos/2/` o `PATCH /api/productos/2/`
```
¿Qué hace? → Modifica la información de UN producto
¿Cuándo usarlo? → Cuando cambias el precio, agregas stock, etc.

Ejemplo en la vida real:
- Vendiste 2 iPhones, ahora solo te quedan 1

Lo que envías (PATCH - solo lo que cambió):
{
  "stock": 1
}

Respuesta que recibes:
{
  "id": 2,
  "nombre": "iPhone 15",
  "precio": 20000,
  "stock": 1  ← Actualizado!
}

Diferencia PUT vs PATCH:
- PUT → Tienes que enviar TODA la información del producto
- PATCH → Solo envías lo que quieres cambiar (más común)
```

#### 5️⃣ **Eliminar** - `DELETE /api/productos/3/`
```
¿Qué hace? → Elimina UN producto de tu sistema
¿Cuándo usarlo? → Cuando ya no vendes ese producto

Ejemplo en la vida real:
- Ya no vas a vender más Mouse Logitech (ID 3)

Respuesta que recibes:
(Nada, solo un código 204 que significa "eliminado exitosamente")
```

---

### 🔍 Búsquedas y Filtros (Query Parameters)

Además de los 5 básicos, puedes agregar **filtros** a tus búsquedas usando `?` en la URL:

#### Buscar por Nombre
```
GET /api/productos/?search=laptop

¿Qué hace? → Busca todos los productos que tengan "laptop" en el nombre

Ejemplo en la vida real:
- Un cliente pregunta "¿Qué laptops tienes?"

Respuesta:
[
  {"id": 1, "nombre": "Laptop Dell", "precio": 15000},
  {"id": 5, "nombre": "Laptop HP", "precio": 12000}
]
```

#### Filtrar por Estado
```
GET /api/productos/?activo=true

¿Qué hace? → Muestra solo los productos activos (que todavía vendes)

Ejemplo en la vida real:
- Quieres ver solo los productos disponibles para venta
```

#### Combinar Filtros
```
GET /api/productos/?search=laptop&activo=true

¿Qué hace? → Busca laptops que estén activas

Puedes combinar varios filtros con &
```

---

### ⚡ Acciones Personalizadas (Extras)

Además de los 5 básicos, puedes crear **acciones especiales**:

#### Acción en UN Producto Específico
```
POST /api/productos/2/activar/

¿Qué hace? → Activa el producto con ID 2
¿Cuándo usarlo? → Cuando vuelves a vender un producto que habías desactivado

Ejemplo en la vida real:
- Habías dejado de vender iPhone 15, pero ahora volviste a tener stock
```

#### Acción en TODOS los Productos
```
GET /api/productos/bajo_stock/

¿Qué hace? → Muestra productos con poco stock (menos de 10)
¿Cuándo usarlo? → Para saber qué necesitas comprar

Respuesta:
[
  {"id": 2, "nombre": "iPhone 15", "stock": 1},
  {"id": 6, "nombre": "Audífonos", "stock": 3}
]
```

---

### 📊 Resumen Visual

```
Tu Tienda de Productos
│
├─ GET /api/productos/              → 📋 Ver TODOS los productos
├─ POST /api/productos/             → ➕ Agregar producto nuevo
├─ GET /api/productos/2/            → 👁️ Ver producto #2
├─ PATCH /api/productos/2/          → ✏️ Modificar producto #2
├─ DELETE /api/productos/2/         → 🗑️ Eliminar producto #2
│
├─ GET /api/productos/?search=laptop     → 🔍 Buscar "laptop"
├─ GET /api/productos/?activo=true       → ✅ Solo activos
│
├─ POST /api/productos/2/activar/        → ⚡ Activar producto #2
└─ GET /api/productos/bajo_stock/        → 📉 Productos con poco stock
```

---

### 💡 Regla de Oro

**¿Cómo saber qué endpoint usar?**

1. **¿Quieres ver TODOS?** → `GET /api/productos/`
2. **¿Quieres ver UNO?** → `GET /api/productos/{id}/`
3. **¿Quieres crear?** → `POST /api/productos/`
4. **¿Quieres modificar?** → `PATCH /api/productos/{id}/`
5. **¿Quieres eliminar?** → `DELETE /api/productos/{id}/`
6. **¿Quieres buscar/filtrar?** → `GET /api/productos/?search=...`
7. **¿Quieres hacer algo especial?** → Acción personalizada

---

## 🎯 Tipos de ViewSets en BaseDR

### 1. **ModelViewSet** (CRUD Completo)

Proporciona automáticamente las 5 operaciones CRUD:
- `list()` - GET `/api/recurso/` - Listar todos
- `create()` - POST `/api/recurso/` - Crear nuevo
- `retrieve()` - GET `/api/recurso/{id}/` - Obtener uno
- `update()` - PUT `/api/recurso/{id}/` - Actualizar completo
- `partial_update()` - PATCH `/api/recurso/{id}/` - Actualizar parcial
- `destroy()` - DELETE `/api/recurso/{id}/` - Eliminar

**Ejemplo del proyecto**: `UserViewSet`, `RoleViewSet`, `ModuleViewSet`

### 2. **ViewSet** (Operaciones Personalizadas)

Para endpoints que no requieren CRUD completo o tienen lógica personalizada.

**Ejemplo del proyecto**: `HelloViewSet`

---

## 📝 Paso 1: Crear el Registro del Módulo (Base de Datos)

### Objetivo
Registrar el nuevo módulo en la base de datos para que el sistema de permisos lo reconozca.

### Herramienta
Utiliza el script `backend/create_module.py` que acepta parámetros por línea de comandos.

### Comando

```bash
python backend/create_module.py --code PRODUCTOS --name "Productos" --desc "Gestión de productos del inventario"
```

### Parámetros

- `--code`: Código único del módulo (MAYÚSCULAS, ej. `PRODUCTOS`, `VENTAS`)
- `--name`: Nombre visible del módulo
- `--desc`: Descripción opcional

### Resultado Esperado

```
✅ Módulo 'Productos' (PRODUCTOS) creado exitosamente.
✅ Módulo asignado al rol 'Superadmin'.
```

> [!IMPORTANT]
> El código del módulo **DEBE estar en MAYÚSCULAS** para mantener consistencia con el sistema RBAC.

---

## 🗄️ Paso 2: Crear el Modelo (Si Aplica)

Si tu módulo requiere almacenar datos, define el modelo en `backend/core/models.py`.

### Ejemplo: Modelo de Productos

**Archivo**: `backend/core/models.py`

```python
from django.db import models

class Producto(models.Model):
    """Modelo para gestión de productos del inventario."""
    
    nombre = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.IntegerField(default=0, verbose_name="Stock Disponible")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return self.nombre
```

### Crear y Aplicar Migraciones

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## 🔧 Paso 3: Crear el Serializer

Los serializers convierten los modelos Django a JSON y viceversa.

**Archivo**: `backend/core/serializers.py`

```python
from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Producto."""
    
    class Meta:
        model = Producto
        fields = [
            'id',
            'nombre',
            'descripcion',
            'precio',
            'stock',
            'activo',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate_precio(self, value):
        """Validar que el precio sea positivo."""
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value
    
    def validate_stock(self, value):
        """Validar que el stock no sea negativo."""
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo.")
        return value
```

### Serializer con Relaciones

Si tu modelo tiene relaciones con otros modelos:

```python
class ProductoDetalladoSerializer(serializers.ModelSerializer):
    """Serializer con información detallada y relaciones."""
    
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    proveedor_info = ProveedorSerializer(source='proveedor', read_only=True)
    
    class Meta:
        model = Producto
        fields = '__all__'
```

---

## 🚀 Paso 4: Crear el ViewSet (Backend API)

### 4.1. ModelViewSet - CRUD Completo

**Archivo**: `backend/core/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Producto
from .serializers import ProductoSerializer
from .permissions import HasModuleAccess

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de productos.
    
    Proporciona operaciones CRUD:
    - list: GET /api/productos/
    - create: POST /api/productos/
    - retrieve: GET /api/productos/{id}/
    - update: PUT /api/productos/{id}/
    - partial_update: PATCH /api/productos/{id}/
    - destroy: DELETE /api/productos/{id}/
    """
    
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [HasModuleAccess]
    required_module_code = 'PRODUCTOS'  # Debe coincidir con el código en BD
    
    def get_queryset(self):
        """
        Personalizar el queryset según parámetros de búsqueda.
        
        Este método se ejecuta AUTOMÁTICAMENTE cuando alguien hace:
        GET /api/productos/?search=laptop&activo=true
        
        Los parámetros después del ? se llaman "query parameters"
        y los puedes obtener con: self.request.query_params.get('nombre_parametro')
        """
        queryset = super().get_queryset()  # Obtiene TODOS los productos
        
        # 🔍 FILTRO 1: Por estado activo/inactivo
        # Ejemplo: GET /api/productos/?activo=true
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # 🔍 FILTRO 2: Búsqueda por nombre
        # Ejemplo: GET /api/productos/?search=laptop
        # El "icontains" busca sin importar mayúsculas/minúsculas
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(nombre__icontains=search)
        
        # 💡 PUEDES AGREGAR MÁS FILTROS:
        # precio_min = self.request.query_params.get('precio_min', None)
        # if precio_min:
        #     queryset = queryset.filter(precio__gte=precio_min)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Lógica adicional al crear un producto.
        """
        # Puedes agregar lógica personalizada aquí
        serializer.save()
    
    def perform_update(self, serializer):
        """
        Lógica adicional al actualizar un producto.
        """
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Lógica adicional al eliminar un producto.
        Soft delete en lugar de eliminación física.
        """
        instance.activo = False
        instance.save()
        # O para eliminación física:
        # instance.delete()
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """
        Acción personalizada: POST /api/productos/{id}/activar/
        Activa un producto desactivado.
        """
        producto = self.get_object()
        producto.activo = True
        producto.save()
        serializer = self.get_serializer(producto)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """
        Acción personalizada: POST /api/productos/{id}/desactivar/
        Desactiva un producto.
        """
        producto = self.get_object()
        producto.activo = False
        producto.save()
        serializer = self.get_serializer(producto)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def bajo_stock(self, request):
        """
        Acción personalizada: GET /api/productos/bajo_stock/
        Retorna productos con stock menor a 10 unidades.
        """
        productos = self.queryset.filter(stock__lt=10, activo=True)
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Acción personalizada: GET /api/productos/estadisticas/
        Retorna estadísticas generales de productos.
        """
        total = self.queryset.count()
        activos = self.queryset.filter(activo=True).count()
        bajo_stock = self.queryset.filter(stock__lt=10, activo=True).count()
        
        return Response({
            'total_productos': total,
            'productos_activos': activos,
            'productos_bajo_stock': bajo_stock
        })
```

### 4.2. ViewSet Simple - Sin Modelo

Para endpoints que no requieren CRUD completo:

```python
from rest_framework import viewsets
from rest_framework.response import Response
from .permissions import HasModuleAccess

class ReportesViewSet(viewsets.ViewSet):
    """
    ViewSet para generación de reportes.
    No está vinculado a un modelo específico.
    """
    
    permission_classes = [HasModuleAccess]
    required_module_code = 'REPORTES'
    
    def list(self, request):
        """
        GET /api/reportes/
        Lista los tipos de reportes disponibles.
        """
        reportes_disponibles = [
            {'id': 1, 'nombre': 'Reporte de Ventas', 'tipo': 'ventas'},
            {'id': 2, 'nombre': 'Reporte de Inventario', 'tipo': 'inventario'},
            {'id': 3, 'nombre': 'Reporte de Usuarios', 'tipo': 'usuarios'},
        ]
        return Response(reportes_disponibles)
    
    def retrieve(self, request, pk=None):
        """
        GET /api/reportes/{id}/
        Genera un reporte específico.
        """
        # Lógica para generar el reporte
        reporte_data = {
            'id': pk,
            'fecha_generacion': '2026-01-21',
            'datos': [...]
        }
        return Response(reporte_data)
    
    @action(detail=False, methods=['post'])
    def generar(self, request):
        """
        POST /api/reportes/generar/
        Genera un reporte personalizado con parámetros.
        """
        tipo = request.data.get('tipo')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        
        # Lógica de generación de reporte
        reporte = {
            'tipo': tipo,
            'periodo': f"{fecha_inicio} - {fecha_fin}",
            'datos': [...]
        }
        
        return Response(reporte, status=status.HTTP_201_CREATED)
```

---

## 🔗 Paso 5: Registrar las Rutas

**Archivo**: `backend/core/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    RoleViewSet,
    ModuleViewSet,
    ProductoViewSet,
    ReportesViewSet,
    HelloViewSet
)

# Crear el router
router = DefaultRouter()

# Registrar ViewSets
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'reportes', ReportesViewSet, basename='reporte')
router.register(r'hello', HelloViewSet, basename='hello')

urlpatterns = [
    path('', include(router.urls)),
]
```

### URLs Generadas Automáticamente

Para `ProductoViewSet`:

```
GET    /api/productos/              - Listar todos los productos
POST   /api/productos/              - Crear nuevo producto
GET    /api/productos/{id}/         - Obtener un producto
PUT    /api/productos/{id}/         - Actualizar producto completo
PATCH  /api/productos/{id}/         - Actualizar producto parcial
DELETE /api/productos/{id}/         - Eliminar producto

# Acciones personalizadas
POST   /api/productos/{id}/activar/     - Activar producto
POST   /api/productos/{id}/desactivar/  - Desactivar producto
GET    /api/productos/bajo_stock/       - Productos con bajo stock
GET    /api/productos/estadisticas/     - Estadísticas generales
```

---

## 🎨 Paso 6: Crear la Interfaz Frontend

### 6.1. Crear el Componente de Página

**Archivo**: `frontend/src/pages/Productos.jsx`

```javascript
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import api from '../services/api';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        activo: true
    });

    // Cargar productos al montar el componente
    useEffect(() => {
        fetchProductos();
    }, []);

    // Función para obtener todos los productos
    const fetchProductos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/productos/');
            setProductos(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los productos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Función para buscar productos
    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        try {
            const response = await api.get(`/productos/?search=${term}`);
            setProductos(response.data);
        } catch (err) {
            console.error('Error al buscar:', err);
        }
    };

    // Función para crear nuevo producto
    const handleCreate = async (e) => {
        e.preventDefault();
        
        try {
            const response = await api.post('/productos/', formData);
            setProductos([...productos, response.data]);
            setShowModal(false);
            resetForm();
        } catch (err) {
            alert('Error al crear producto');
            console.error(err);
        }
    };

    // Función para actualizar producto
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        try {
            const response = await api.put(`/productos/${editingProducto.id}/`, formData);
            setProductos(productos.map(p => 
                p.id === editingProducto.id ? response.data : p
            ));
            setShowModal(false);
            resetForm();
        } catch (err) {
            alert('Error al actualizar producto');
            console.error(err);
        }
    };

    // Función para eliminar producto
    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        
        try {
            await api.delete(`/productos/${id}/`);
            setProductos(productos.filter(p => p.id !== id));
        } catch (err) {
            alert('Error al eliminar producto');
            console.error(err);
        }
    };

    // Función para activar/desactivar producto
    const toggleActivo = async (producto) => {
        try {
            const endpoint = producto.activo ? 'desactivar' : 'activar';
            const response = await api.post(`/productos/${producto.id}/${endpoint}/`);
            setProductos(productos.map(p => 
                p.id === producto.id ? response.data : p
            ));
        } catch (err) {
            alert('Error al cambiar estado del producto');
            console.error(err);
        }
    };

    // Funciones auxiliares
    const openCreateModal = () => {
        resetForm();
        setEditingProducto(null);
        setShowModal(true);
    };

    const openEditModal = (producto) => {
        setFormData({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            activo: producto.activo
        });
        setEditingProducto(producto);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            stock: '',
            activo: true
        });
        setEditingProducto(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Cargando productos...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-8 h-8" />
                        Gestión de Productos
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Administra el inventario de productos
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {productos.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {producto.nombre}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">
                                        {producto.descripcion || 'Sin descripción'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ${parseFloat(producto.precio).toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-medium ${
                                        producto.stock < 10 ? 'text-red-600' : 'text-gray-900'
                                    }`}>
                                        {producto.stock} unidades
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        producto.activo 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {producto.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(producto)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(producto.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        <form onSubmit={editingProducto ? handleUpdate : handleCreate}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Precio</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Stock</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-700">Activo</span>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                                >
                                    {editingProducto ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;
```

### 6.2. Registrar la Ruta

**Archivo**: `frontend/src/App.jsx`

```javascript
import Productos from './pages/Productos';

// Dentro de las rutas protegidas:
<Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/users" element={<Users />} />
    <Route path="/roles" element={<Roles />} />
    <Route path="/productos" element={<Productos />} />
    {/* ... otras rutas ... */}
</Route>
```

### 6.3. Añadir al Menú Lateral

**Archivo**: `frontend/src/components/layout/Sidebar.jsx`

```javascript
import { Package } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', code: 'DASHBOARD' },
    { name: 'Usuarios', icon: Users, path: '/users', code: 'USERS' },
    { name: 'Roles', icon: Shield, path: '/roles', code: 'ROLES' },
    { name: 'Productos', icon: Package, path: '/productos', code: 'PRODUCTOS' },
    // ... otros items ...
];
```

---

## ✅ Checklist de Creación de Módulo CRUD Completo

### Base de Datos
- [ ] Ejecutar `create_module.py` con código en MAYÚSCULAS
- [ ] Verificar que el módulo se asignó a Superadmin

### Backend
- [ ] Crear modelo en `models.py` (si aplica)
- [ ] Ejecutar `makemigrations` y `migrate`
- [ ] Crear serializer en `serializers.py`
- [ ] Crear ViewSet en `views.py` con `HasModuleAccess`
- [ ] Definir `required_module_code` (MAYÚSCULAS)
- [ ] Registrar en router en `urls.py`
- [ ] Probar endpoints con Postman/curl

### Frontend
- [ ] Crear componente en `src/pages/`
- [ ] Implementar operaciones CRUD con `api`
- [ ] Registrar ruta en `App.jsx`
- [ ] Añadir item al sidebar con código correcto
- [ ] Importar icono de `lucide-react`
- [ ] Probar UI como admin
- [ ] Verificar RBAC con usuario limitado

---

## 🧪 Verificación y Pruebas

### Probar Backend con curl

```bash
# 1. Obtener token
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.access')

# 2. Listar productos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/productos/

# 3. Crear producto
curl -X POST http://localhost:8000/api/productos/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Dell",
    "descripcion": "Laptop empresarial",
    "precio": 15000.00,
    "stock": 5,
    "activo": true
  }'

# 4. Obtener producto específico
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/productos/1/

# 5. Actualizar producto
curl -X PATCH http://localhost:8000/api/productos/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock": 10}'

# 6. Eliminar producto
curl -X DELETE http://localhost:8000/api/productos/1/ \
  -H "Authorization: Bearer $TOKEN"

# 7. Acción personalizada
curl -X POST http://localhost:8000/api/productos/1/activar/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: `'ProductoViewSet' object has no attribute 'get_queryset'`
**Causa**: Usaste `ViewSet` en lugar de `ModelViewSet`  
**Solución**: Cambia a `ModelViewSet` o implementa manualmente los métodos

### Error: `ImproperlyConfigured: basename argument not specified`
**Causa**: Falta el parámetro `basename` en `router.register()`  
**Solución**: Agrega `basename='producto'` al registrar

### Error 403 Forbidden
**Causa**: Discrepancia en código de módulo o usuario sin permisos  
**Solución**: Verifica que `required_module_code` coincida con BD (MAYÚSCULAS)

### Error: `Producto matching query does not exist`
**Causa**: Intentas acceder a un ID que no existe  
**Solución**: Verifica que el producto existe antes de acceder

### El item no aparece en el sidebar
**Causa**: Usuario no tiene el módulo asignado  
**Solución**: Asigna el módulo al rol del usuario desde UI de Roles

---

## 📚 Recursos Adicionales

- **Django REST Framework ViewSets**: https://www.django-rest-framework.org/api-guide/viewsets/
- **Django REST Framework Routers**: https://www.django-rest-framework.org/api-guide/routers/
- **Django REST Framework Serializers**: https://www.django-rest-framework.org/api-guide/serializers/
- **Iconos Lucide React**: https://lucide.dev/icons/
- **React Hooks**: https://react.dev/reference/react

---

**Última actualización:** 21/01/2026  
**Versión:** 2.0.0
