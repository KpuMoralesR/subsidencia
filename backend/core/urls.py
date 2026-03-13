from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RoleViewSet, ModuleViewSet, InventarioViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'modules', ModuleViewSet)

router.register(r'inventario', InventarioViewSet, basename='inventario')

urlpatterns = [
    path('', include(router.urls)),
]
