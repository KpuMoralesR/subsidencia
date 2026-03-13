from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RoleViewSet, ModuleViewSet, HelloViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'modules', ModuleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
