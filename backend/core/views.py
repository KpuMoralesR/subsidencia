from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Role, Module
from .serializers import UserSerializer, RoleSerializer, ModuleSerializer, ProfileSerializer
from .permissions import HasModuleAccess, RolePermission
from . import permissions as role_permissions # alias to avoid conflict if needed, or just import logic

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasModuleAccess]
    required_module_code = 'USERS'
    
    def get_queryset(self):
        """
        Excluye superusuarios de la lista de gestión.
        Los superusuarios solo se gestionan desde el admin de Django.
        """
        return User.objects.filter(is_superuser=False)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """
        GET: Obtiene el perfil del usuario autenticado
        PATCH: Actualiza el perfil del usuario autenticado
        
        Accesible para todos los usuarios autenticados sin necesidad de permisos de módulo.
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = ProfileSerializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = ProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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