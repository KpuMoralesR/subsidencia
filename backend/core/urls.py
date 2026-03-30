from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, RoleViewSet, ModuleViewSet, 
    InventarioViewSet, PozoViewSet, LitologiaViewSet, PuntoInSARViewSet,
    TransectImageView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'inventario', InventarioViewSet, basename='inventario')
router.register(r'pozos', PozoViewSet, basename='pozos')
router.register(r'litologia', LitologiaViewSet, basename='litologia')
router.register(r'insar', PuntoInSARViewSet, basename='insar')

urlpatterns = [
    path('transecto-geologico/', TransectImageView.as_view(), name='transecto-geologico'),
    path('', include(router.urls)),
]
