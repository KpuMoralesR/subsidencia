import os
import sys
import django
import argparse

# Configurar el entorno de Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Module, Role

def create_module(code, name, description):
    try:
        # 1. Crear o recuperar el módulo
        # Convertimos el código a mayúsculas para mantener consistencia
        code = code.upper()
        
        module, created = Module.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'description': description
            }
        )
        
        action = "creado" if created else "recuperado"
        print(f"✅ Módulo '{name}' ({code}) {action} exitosamente.")

        # 2. Asignar a Superadmin
        try:
            role = Role.objects.get(name='Superadmin')
            role.modules.add(module)
            print(f"✅ Módulo asignado al rol '{role.name}'.")
        except Role.DoesNotExist:
            print("⚠️ Advertencia: No se encontró el rol 'Superadmin'. El módulo existe pero no está asignado.")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Crear un nuevo módulo y asignarlo a Superadmin')
    parser.add_argument('--code', type=str, required=True, help='Código único del módulo (ej. HELLO)')
    parser.add_argument('--name', type=str, required=True, help='Nombre visible del módulo')
    parser.add_argument('--desc', type=str, default='', help='Descripción opcional del módulo')

    args = parser.parse_args()
    
    create_module(args.code, args.name, args.desc)
