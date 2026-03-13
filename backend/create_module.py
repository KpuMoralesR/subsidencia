import os
import sys
import re
import django
import argparse

# ─── Configurar entorno Django ─────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_SRC = os.path.join(BACKEND_DIR, '..', 'frontend', 'src')

sys.path.append(BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Module

# ─── Iconos disponibles (lucide-react) ────────────────────────────────────────
ICON_MAP = {
    'box': 'Box',
    'chart': 'BarChart2',
    'settings': 'Settings',
    'users': 'Users',
    'shield': 'Shield',
    'file': 'FileText',
    'home': 'Home',
    'bell': 'Bell',
    'tool': 'Wrench',
    'star': 'Star',
    'map': 'Map',
    'calendar': 'Calendar',
    'mail': 'Mail',
    'lock': 'Lock',
    'globe': 'Globe',
    'database': 'Database',
    'package': 'Package',
    'layers': 'Layers',
}

# ─── 1. BD: crear o recuperar módulo ──────────────────────────────────────────
def create_db_module(code, name, description):
    code = code.upper()
    module, created = Module.objects.get_or_create(
        code=code,
        defaults={'name': name, 'description': description}
    )
    action = "creado" if created else "ya existía"
    print(f"✅ [BD] Módulo '{name}' ({code}) {action}.")
    return module, code

# ─── 2. Frontend: crear página JSX ────────────────────────────────────────────
def create_page(component_name, name, code, path_slug):
    pages_dir = os.path.join(FRONTEND_SRC, 'pages')
    page_file = os.path.join(pages_dir, f'{component_name}.jsx')

    if os.path.exists(page_file):
        print(f"⚠️  [Frontend] La página '{component_name}.jsx' ya existe, se omite.")
        return

    content = f"""import React from 'react';

const {component_name} = () => {{
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {name}
                </h1>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Módulo: <span className="font-mono font-bold">{code}</span>
                </p>
                <p className="text-gray-400 mt-2 text-sm">
                    Contenido del módulo en construcción.
                </p>
            </div>
        </div>
    );
}};

export default {component_name};
"""
    with open(page_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ [Frontend] Página creada: src/pages/{component_name}.jsx")

# ─── 3. Frontend: agregar ruta a App.jsx ──────────────────────────────────────
def add_route(component_name, path_slug):
    app_file = os.path.join(FRONTEND_SRC, 'App.jsx')
    with open(app_file, 'r', encoding='utf-8') as f:
        content = f.read()

    import_line = f"import {component_name} from './pages/{component_name}';"
    route_line  = f"                        <Route path=\"/{path_slug}\" element={{<{component_name} />}} />"

    if import_line in content:
        print(f"⚠️  [Frontend] Import de '{component_name}' ya existe en App.jsx, se omite.")
    else:
        # Insertar import antes de la línea "function App()"
        content = content.replace(
            "function App() {",
            f"{import_line}\n\nfunction App() {{"
        )
        print(f"✅ [Frontend] Import agregado en App.jsx")

    if route_line in content:
        print(f"⚠️  [Frontend] Ruta '/{path_slug}' ya existe en App.jsx, se omite.")
    else:
        # Insertar ruta antes del cierre </Route> del ProtectedRoute
        content = content.replace(
            "                    </Route>\n\n                    {/* Fallback */}",
            f"{route_line}\n                    </Route>\n\n                    {{/* Fallback */}}"
        )
        print(f"✅ [Frontend] Ruta '/{path_slug}' agregada en App.jsx")

    with open(app_file, 'w', encoding='utf-8') as f:
        f.write(content)

# ─── 4. Frontend: agregar entrada al Sidebar ──────────────────────────────────
def add_sidebar_entry(name, path_slug, code, icon_name):
    sidebar_file = os.path.join(FRONTEND_SRC, 'components', 'layout', 'Sidebar.jsx')
    with open(sidebar_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Verificar si el código ya está registrado
    if f"code: '{code}'" in content:
        print(f"⚠️  [Frontend] Entrada '{code}' ya existe en Sidebar.jsx, se omite.")
        return

    # Agregar el icon a los imports de lucide-react
    icon_import_match = re.search(r"import \{([^}]+)\} from 'lucide-react';", content)
    if icon_import_match:
        current_icons = icon_import_match.group(1).strip()
        if icon_name not in current_icons:
            new_icons = current_icons + f', {icon_name}'
            content = content.replace(
                icon_import_match.group(0),
                f"import {{ {new_icons} }} from 'lucide-react';"
            )
            print(f"✅ [Frontend] Ícono '{icon_name}' agregado a imports del Sidebar.")

    # Insertar nueva entrada justo antes del cierre de menuItems `];`
    new_entry = f"        {{ name: '{name}', icon: {icon_name}, path: '/{path_slug}', code: '{code}' }},"
    # Encontrar el último item del arreglo y agregar después
    content = re.sub(
        r"(        \{ name: '[^']+', icon: \w+, path: '[^']+', code: '[^']+' \},)\n    \];",
        rf"\1\n{new_entry}\n    ];",
        content
    )
    print(f"✅ [Frontend] Entrada '{name}' agregada al Sidebar.")

    with open(sidebar_file, 'w', encoding='utf-8') as f:
        f.write(content)

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Crea un módulo completo: BD + página React + ruta + Sidebar'
    )
    parser.add_argument('--code',      type=str, required=True,  help='Código único (ej: REPORTS)')
    parser.add_argument('--name',      type=str, required=True,  help='Nombre visible (ej: "Reportes")')
    parser.add_argument('--desc',      type=str, default='',     help='Descripción opcional')
    parser.add_argument('--path',      type=str, default=None,   help='Slug de ruta URL (por defecto: code en minúsculas)')
    parser.add_argument('--component', type=str, default=None,   help='Nombre del componente React (por defecto: capitalizado del code)')
    parser.add_argument('--icon',      type=str, default='box',  help=f'Ícono lucide-react. Opciones: {", ".join(ICON_MAP.keys())}')
    args = parser.parse_args()

    code       = args.code.upper()
    path_slug  = args.path or code.lower()
    component  = args.component or code.capitalize()
    icon_name  = ICON_MAP.get(args.icon.lower(), 'Box')

    print(f"\n🚀 Creando módulo '{args.name}' ({code})...\n")

    # 1. Base de datos
    create_db_module(code, args.name, args.desc)

    # 2. Página JSX
    create_page(component, args.name, code, path_slug)

    # 3. Ruta en App.jsx
    add_route(component, path_slug)

    # 4. Sidebar
    add_sidebar_entry(args.name, path_slug, code, icon_name)

    print(f"\n🎉 Módulo '{args.name}' listo. Recarga el navegador para verlo en el Sidebar.\n")
