import os
import sys
import re
import subprocess
import django
import argparse

# ─── Rutas base ───────────────────────────────────────────────────────────────
BACKEND_DIR   = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BACKEND_DIR, 'templates')
FRONTEND_SRC  = os.path.join(BACKEND_DIR, '..', 'frontend', 'src')
CORE_DIR      = os.path.join(BACKEND_DIR, 'core')

sys.path.append(BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Module

# ─── Íconos disponibles (lucide-react) ────────────────────────────────────────
ICON_MAP = {
    'box': 'Box', 'chart': 'BarChart2', 'settings': 'Settings',
    'users': 'Users', 'shield': 'Shield', 'file': 'FileText',
    'home': 'Home', 'bell': 'Bell', 'tool': 'Wrench', 'star': 'Star',
    'map': 'Map', 'calendar': 'Calendar', 'mail': 'Mail', 'lock': 'Lock',
    'globe': 'Globe', 'database': 'Database', 'package': 'Package',
    'layers': 'Layers',
}

def ask(question):
    while True:
        resp = input(f"{question} (s/n): ").strip().lower()
        if resp in ('s', 'si', 'sí', 'y', 'yes'):
            return True
        if resp in ('n', 'no'):
            return False
        print("  Por favor responde 's' o 'n'.")


# ══════════════════════════════════════════════════════════════════════════════
#  PASO 1 — BD: módulo de permisos
# ══════════════════════════════════════════════════════════════════════════════
def create_db_module(code, name, description):
    code = code.upper()
    module, created = Module.objects.get_or_create(
        code=code,
        defaults={'name': name, 'description': description}
    )
    print(f"  {'✅ Creado' if created else '⚠️  Ya existía'}: Módulo '{name}' ({code})")
    return module, code


# ══════════════════════════════════════════════════════════════════════════════
#  PASO 2 — Backend: modelo, serializer, viewset, url
# ══════════════════════════════════════════════════════════════════════════════
def add_model(component):
    path = os.path.join(CORE_DIR, 'models.py')
    content = open(path, encoding='utf-8').read()
    if f'class {component}(models.Model):' in content:
        print(f"  ⚠️  Modelo '{component}' ya existe en models.py")
        return False
    snippet = (
        f'\n\nclass {component}(models.Model):\n'
        f'    name        = models.CharField(max_length=200)\n'
        f'    description = models.TextField(blank=True)\n'
        f'    created_at  = models.DateTimeField(auto_now_add=True)\n'
        f'    updated_at  = models.DateTimeField(auto_now=True)\n\n'
        f'    class Meta:\n'
        f'        verbose_name = "{component}"\n'
        f'        verbose_name_plural = "{component}s"\n\n'
        f'    def __str__(self):\n'
        f'        return self.name\n'
    )
    open(path, 'a', encoding='utf-8').write(snippet)
    print(f"  ✅ Modelo '{component}' agregado a models.py")
    return True


def add_serializer(component):
    path = os.path.join(CORE_DIR, 'serializers.py')
    content = open(path, encoding='utf-8').read()
    if f'class {component}Serializer' in content:
        print(f"  ⚠️  Serializer '{component}Serializer' ya existe")
        return
    # Actualizar import
    m = re.search(r'from \.models import (.+)', content)
    if m and component not in m.group(1):
        content = content.replace(m.group(0), f'from .models import {m.group(1).strip()}, {component}')
    snippet = (
        f'\n\nclass {component}Serializer(serializers.ModelSerializer):\n'
        f'    class Meta:\n'
        f'        model = {component}\n'
        f'        fields = "__all__"\n'
    )
    open(path, 'w', encoding='utf-8').write(content + snippet)
    print(f"  ✅ Serializer '{component}Serializer' agregado a serializers.py")


def add_viewset(component, code, with_model):
    path = os.path.join(CORE_DIR, 'views.py')
    content = open(path, encoding='utf-8').read()
    if f'class {component}ViewSet' in content:
        print(f"  ⚠️  ViewSet '{component}ViewSet' ya existe en views.py")
        return
    # Actualizar imports si hay modelo
    if with_model:
        m = re.search(r'from \.models import (.+)', content)
        if m and component not in m.group(1):
            content = content.replace(m.group(0), f'from .models import {m.group(1).strip()}, {component}')
        m2 = re.search(r'from \.serializers import (.+)', content)
        if m2 and f'{component}Serializer' not in m2.group(1):
            content = content.replace(m2.group(0), f'from .serializers import {m2.group(1).strip()}, {component}Serializer')
        snippet = (
            f'\n\nclass {component}ViewSet(viewsets.ModelViewSet):\n'
            f'    """ViewSet CRUD para el módulo {component} (código: {code})."""\n'
            f'    queryset = {component}.objects.all()\n'
            f'    serializer_class = {component}Serializer\n'
            f'    permission_classes = [HasModuleAccess]\n'
            f'    required_module_code = "{code}"\n'
        )
    else:
        snippet = (
            f'\n\nclass {component}ViewSet(viewsets.ViewSet):\n'
            f'    """ViewSet para el módulo {component} (código: {code})."""\n'
            f'    permission_classes = [HasModuleAccess]\n'
            f'    required_module_code = "{code}"\n\n'
            f'    def list(self, request):\n'
            f'        return Response({{"message": "Módulo {component} activo.", "code": "{code}"}})\n'
        )
    open(path, 'w', encoding='utf-8').write(content + snippet)
    print(f"  ✅ ViewSet '{component}ViewSet' agregado a views.py")


def add_url(component, path_slug):
    path = os.path.join(CORE_DIR, 'urls.py')
    content = open(path, encoding='utf-8').read()
    if f'{component}ViewSet' in content:
        print(f"  ⚠️  URL para '{component}ViewSet' ya existe en urls.py")
        return
    # Actualizar import
    m = re.search(r'from \.views import (.+)', content)
    if m:
        content = content.replace(m.group(0), f'from .views import {m.group(1).strip()}, {component}ViewSet')
    # Agregar registro antes de urlpatterns
    route = f"router.register(r'{path_slug}', {component}ViewSet, basename='{path_slug}')\n"
    content = content.replace('\nurlpatterns = [', f'\n{route}\nurlpatterns = [')
    open(path, 'w', encoding='utf-8').write(content)
    print(f"  ✅ Ruta '/api/{path_slug}/' registrada en urls.py")


def run_migrations():
    print("\n  🔄 Ejecutando migraciones...")
    r1 = subprocess.run([sys.executable, 'manage.py', 'makemigrations'], cwd=BACKEND_DIR, capture_output=True, text=True)
    for line in r1.stdout.strip().splitlines():
        print(f"     {line}")
    r2 = subprocess.run([sys.executable, 'manage.py', 'migrate'], cwd=BACKEND_DIR, capture_output=True, text=True)
    for line in r2.stdout.strip().splitlines():
        print(f"     {line}")
    print("  ✅ Migraciones completadas.")


# ══════════════════════════════════════════════════════════════════════════════
#  PASO 3 — Frontend: página JSX desde template
# ══════════════════════════════════════════════════════════════════════════════
def create_page(component, name, code, path_slug, with_model):
    page_file = os.path.join(FRONTEND_SRC, 'pages', f'{component}.jsx')
    if os.path.exists(page_file):
        print(f"  ⚠️  Página '{component}.jsx' ya existe, se omite.")
        return
    tpl_name = 'page_with_model.jsx.tpl' if with_model else 'page_simple.jsx.tpl'
    tpl_path = os.path.join(TEMPLATES_DIR, tpl_name)
    tpl = open(tpl_path, encoding='utf-8').read()
    content = (tpl
        .replace('__COMPONENT__', component)
        .replace('__NAME__', name)
        .replace('__CODE__', code)
        .replace('__PATH_SLUG__', path_slug)
    )
    open(page_file, 'w', encoding='utf-8').write(content)
    print(f"  ✅ Página creada: src/pages/{component}.jsx")


def add_route(component, path_slug):
    app_file = os.path.join(FRONTEND_SRC, 'App.jsx')
    content = open(app_file, encoding='utf-8').read()
    import_line = f"import {component} from './pages/{component}';"
    route_line  = f'                        <Route path="/{path_slug}" element={{<{component} />}} />'
    if import_line not in content:
        content = content.replace('function App() {', f'{import_line}\n\nfunction App() {{')
        print(f"  ✅ Import de '{component}' agregado en App.jsx")
    else:
        print(f"  ⚠️  Import de '{component}' ya existe en App.jsx")
    if route_line not in content:
        content = content.replace(
            '                    </Route>\n\n                    {/* Fallback */}',
            f'{route_line}\n                    </Route>\n\n                    {{/* Fallback */}}'
        )
        print(f"  ✅ Ruta '/{path_slug}' agregada en App.jsx")
    else:
        print(f"  ⚠️  Ruta '/{path_slug}' ya existe en App.jsx")
    open(app_file, 'w', encoding='utf-8').write(content)


def add_sidebar_entry(name, path_slug, code, icon_name):
    sidebar_file = os.path.join(FRONTEND_SRC, 'components', 'layout', 'Sidebar.jsx')
    content = open(sidebar_file, encoding='utf-8').read()
    if f"code: '{code}'" in content:
        print(f"  ⚠️  Entrada '{code}' ya existe en Sidebar.jsx")
        return
    # Agregar ícono al import
    m = re.search(r"import \{([^}]+)\} from 'lucide-react';", content)
    if m and icon_name not in m.group(1):
        content = content.replace(m.group(0), f"import {{ {m.group(1).strip()}, {icon_name} }} from 'lucide-react';")
    # Insertar nueva entrada al final del array menuItems
    new_entry = f"        {{ name: '{name}', icon: {icon_name}, path: '/{path_slug}', code: '{code}' }},"
    content = re.sub(
        r"(        \{ name: '[^']+', icon: \w+, path: '[^']+', code: '[^']+' \},)\n    \];",
        rf"\1\n{new_entry}\n    ];",
        content
    )
    open(sidebar_file, 'w', encoding='utf-8').write(content)
    print(f"  ✅ Entrada '{name}' agregada al Sidebar.")


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Crea un módulo completo: BD + backend + frontend')
    parser.add_argument('--code',      required=True,  help='Código único (ej: REPORTES)')
    parser.add_argument('--name',      required=True,  help='Nombre visible (ej: "Reportes")')
    parser.add_argument('--desc',      default='',     help='Descripción opcional')
    parser.add_argument('--path',      default=None,   help='Slug URL (por defecto: code en minúsculas)')
    parser.add_argument('--component', default=None,   help='Nombre componente React (por defecto: Code capitalizado)')
    parser.add_argument('--icon',      default='box',  help=f'Ícono: {", ".join(ICON_MAP.keys())}')
    args    = parser.parse_args()
    code      = args.code.upper()
    path_slug = args.path or code.lower()
    component = args.component or code.capitalize()
    icon_name = ICON_MAP.get(args.icon.lower(), 'Box')

    line = '═' * 55
    print(f"\n{line}")
    print(f"  🚀 Creando módulo '{args.name}' ({code})")
    print(f"{line}\n")

    print("📦 [1/4] Registrando módulo en la BD de permisos...")
    create_db_module(code, args.name, args.desc)

    print("\n⚙️  [2/4] Configurando backend...")
    with_model = ask("  ¿Deseas crear una tabla en la BD para este módulo?")
    if with_model:
        model_created = add_model(component)
        add_serializer(component)
        add_viewset(component, code, with_model=True)
        add_url(component, path_slug)
        if model_created:
            run_migrations()
    else:
        add_viewset(component, code, with_model=False)
        add_url(component, path_slug)

    print("\n🎨 [3/4] Generando página frontend...")
    create_page(component, args.name, code, path_slug, with_model)
    add_route(component, path_slug)

    print("\n🧭 [4/4] Actualizando Sidebar...")
    add_sidebar_entry(args.name, path_slug, code, icon_name)

    print(f"\n{line}")
    print(f"  🎉 Módulo '{args.name}' creado exitosamente.")
    print(f"  📍 Frontend:  http://localhost:5173/{path_slug}")
    print(f"  📍 API:       http://localhost:8000/api/{path_slug}/")
    print(f"{line}\n")
