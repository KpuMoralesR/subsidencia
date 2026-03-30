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
import os
import uuid
import sys
import base64
from rest_framework.views import APIView
from django.conf import settings

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


class TransectImageView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        points = request.data.get('points', [])
        buffer = float(request.data.get('buffer', 1000))
        relative_depth = request.data.get('relative_depth', False)

        if len(points) < 2:
            return Response({"error": "Need at least 2 points (lat, lng)"}, status=400)

        # Usar los extremos para el transecto genérico (por ahora transect_generator soporta 2 puntos con --coords geo)
        lat1, lon1 = points[0]['lat'], points[0]['lng']
        lat2, lon2 = points[-1]['lat'], points[-1]['lng']

        unique_id = str(uuid.uuid4())[:8]
        out_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        lth_path = os.path.join(out_root, 'core', 'utils', 'transect', 'Totalok.lth')
        out_dir = os.path.join(out_root, f'temp_transect_{unique_id}')

        try:
            # Añadir dinámicamente al sys al runtime aísla a Django de fallos top-level
            transect_pkg_dir = os.path.join(out_root, 'core', 'utils', 'transect')
            if transect_pkg_dir not in sys.path:
                sys.path.append(transect_pkg_dir)
            
            import matplotlib
            matplotlib.use('Agg')
            from transect_generator import TransectAnalyzer

            os.makedirs(out_dir, exist_ok=True)
            analyzer = TransectAnalyzer(lth_path, out_dir)
            analyzer.set_transect_from_points((lat1, lon1), (lat2, lon2), coord_system='geo', name=f"TX_{unique_id}", buffer=buffer)
            # Run sin plots flotantes
            analyzer.run(show_labels=True, relative_depth=relative_depth)

            # Archivos generados
            map_prof_name = f"TX_{unique_id}_buf{int(buffer)}m_map_profile.png"
            cross_name = f"TX_{unique_id}_buf{int(buffer)}m_cross_section{'_reldepth' if relative_depth else ''}.png"
            csv_name = f"TX_{unique_id}_buf{int(buffer)}m_wells.csv"

            map_prof_path = os.path.join(out_dir, map_prof_name)
            cross_path = os.path.join(out_dir, cross_name)
            csv_path = os.path.join(out_dir, csv_name)

            # Escribir el CSV original exacto que pide el usuario
            if hasattr(analyzer, 'results') and analyzer.results is not None and not analyzer.results.empty:
                analyzer.results.to_csv(csv_path, index=False)

            response_data = {}
            if os.path.exists(map_prof_path):
                with open(map_prof_path, "rb") as f:
                    response_data['map_profile'] = base64.b64encode(f.read()).decode('utf-8')
            
            if os.path.exists(cross_path):
                with open(cross_path, "rb") as f:
                    response_data['cross_section'] = base64.b64encode(f.read()).decode('utf-8')

            if os.path.exists(csv_path):
                with open(csv_path, "rb") as f:
                    response_data['csv'] = base64.b64encode(f.read()).decode('utf-8')

            import shutil
            shutil.rmtree(out_dir, ignore_errors=True)

            return Response(response_data, status=200)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
