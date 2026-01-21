from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Role, Module
from .serializers import UserSerializer, RoleSerializer, ModuleSerializer
from .permissions import HasModuleAccess, RolePermission
from . import permissions as role_permissions # alias to avoid conflict if needed, or just import logic

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasModuleAccess]
    required_module_code = 'USERS'

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, role_permissions.RolePermission] 
    # required_module_code = 'roles' # Handled by custom permission now

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated] # Modules list might be public to auth users or 'settings' module

class HelloViewSet(viewsets.ViewSet):
    """
    ViewSet para el módulo de prueba Hello.
    Proporciona un endpoint simple para verificar conectividad.
    """
    permission_classes = [HasModuleAccess]
    required_module_code = 'HELLO'  # Protegido por RBAC
    
    def list(self, request):
        """Retorna un mensaje de saludo desde el backend."""
        return Response({"message": "Hola desde el Backend BaseDR!"})