from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Role, Module

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds the database with initial Module, Role, and User data."

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1. Create Modules
        modules_data = [
            {"code": "DASHBOARD", "name": "Dashboard Principal", "description": "Vista general del sistema"},
            {"code": "USERS", "name": "Gestión de Usuarios", "description": "Administración de cuentas"},
            {"code": "ROLES", "name": "Gestión de Roles", "description": "Configuración de permisos"},
            {"code": "REPORTS", "name": "Reportes", "description": "Visualización de estadísticas"},
            {"code": "SETTINGS", "name": "Configuración", "description": "Ajustes del sistema"},
        ]
        
        modules = {}
        for m_data in modules_data:
            mod, created = Module.objects.get_or_create(
                code=m_data["code"],
                defaults={"name": m_data["name"], "description": m_data["description"]}
            )
            modules[m_data["code"]] = mod
            if created:
                self.stdout.write(f"  Created Module: {m_data['name']}")

        # 2. Create Roles
        roles_data = [
            {
                "name": "Superadmin",
                "modules": ["DASHBOARD", "USERS", "ROLES", "REPORTS", "SETTINGS"]
            },
            {
                "name": "Administrador",
                "modules": ["DASHBOARD", "USERS", "REPORTS"]
            },
            {
                "name": "Usuario",
                "modules": ["DASHBOARD"]
            }
        ]

        roles = {}
        for r_data in roles_data:
            role, created = Role.objects.get_or_create(name=r_data["name"])
            roles[r_data["name"]] = role
            
            # Assign modules
            for mod_code in r_data["modules"]:
                if mod_code in modules:
                    role.modules.add(modules[mod_code])
            
            if created:
                self.stdout.write(f"  Created Role: {r_data['name']}")

        # 3. Create Superadmin User
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com", "role": roles["Superadmin"]}
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()
            self.stdout.write(f"  Created Superuser: admin / admin123")
        else:
            self.stdout.write(f"  Superuser admin already exists.")

        self.stdout.write(self.style.SUCCESS("Data seeding completed successfully."))
