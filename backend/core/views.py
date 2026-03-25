from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Role, Module, Inventario, Pozo, Litologia, PuntoInSAR
from .serializers import (
    UserSerializer, RoleSerializer, ModuleSerializer, 
    ProfileSerializer, InventarioSerializer, PozoSerializer,
    LitologiaSerializer, PuntoInSARSerializer
)
import math
from .permissions import HasModuleAccess, RolePermission
from pyproj import Transformer

def project_point_to_segment(px, py, x1, y1, x2, y2):
    """
    Project point (px, py) onto the segment (x1, y1) -> (x2, y2).
    Returns (dist_along, dist_off, side).
    side: +1 derecha, -1 izquierda (igual que transect_generator.py)
    """
    dx = x2 - x1
    dy = y2 - y1
    l2 = dx*dx + dy*dy
    if l2 == 0:
        return None, math.sqrt((px-x1)**2 + (py-y1)**2), 0

    t = ((px - x1) * dx + (py - y1) * dy) / l2

    proj_x = x1 + t * dx
    proj_y = y1 + t * dy

    dist_along = t * math.sqrt(l2)
    dist_off = math.sqrt((px - proj_x)**2 + (py - proj_y)**2)

    if t < 0 or t > 1:
        return None, dist_off, 0

    # Producto cruz: +1 = derecha, -1 = izquierda
    cross = dx * (py - y1) - dy * (px - x1)
    side = 1 if cross > 1e-10 else (-1 if cross < -1e-10 else 0)

    return dist_along, dist_off, side


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasModuleAccess]
    required_module_code = 'USERS'
    
    def get_queryset(self):
        return User.objects.filter(is_superuser=False)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
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
    permission_classes = [permissions.IsAuthenticated, RolePermission] 

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer
    permission_classes = [HasModuleAccess]
    required_module_code = "INVENTARIO"

class PozoViewSet(viewsets.ModelViewSet):
    queryset = Pozo.objects.all()
    serializer_class = PozoSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def transecto(self, request):
        try:
            x1 = float(request.query_params.get('x1'))
            y1 = float(request.query_params.get('y1'))
            x2 = float(request.query_params.get('x2'))
            y2 = float(request.query_params.get('y2'))
            buffer = float(request.query_params.get('buffer', 800))

            # Convertir de grados a UTM si es necesario
            if abs(x1) < 180 and abs(y1) < 90:
                transformer = Transformer.from_crs("EPSG:4326", "EPSG:32614", always_xy=True)
                x1, y1 = transformer.transform(x1, y1)
                x2, y2 = transformer.transform(x2, y2)

            line_length = math.sqrt((x2-x1)**2 + (y2-y1)**2)
            pozos = Pozo.objects.all()
            resultados = []

            for p in pozos:
                if not p.x or not p.y:
                    continue
                
                dist_along, dist_off, side = project_point_to_segment(
                    float(p.x), float(p.y), x1, y1, x2, y2
                )

                if dist_along is not None and abs(dist_off) <= buffer:
                    resultados.append({
                        "id": p.id,
                        "dist_along": round(dist_along, 1),
                        "dist_off": round(dist_off, 1),
                        "dist_off_signed": round(side * dist_off, 1),  # + derecha, - izquierda
                        "side": side,
                        "well_type": p.well_type or "Lithological",
                        "pozo": PozoSerializer(p).data
                    })

            resultados.sort(key=lambda r: r['dist_along'])
            return Response({
                "wells": resultados,
                "line_length": round(line_length, 1),
                "buffer": buffer,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class LitologiaViewSet(viewsets.ModelViewSet):
    queryset = Litologia.objects.all()
    serializer_class = LitologiaSerializer
    permission_classes = [permissions.AllowAny]

class PuntoInSARViewSet(viewsets.ModelViewSet):
    queryset = PuntoInSAR.objects.all()
    serializer_class = PuntoInSARSerializer
    permission_classes = [permissions.AllowAny]
