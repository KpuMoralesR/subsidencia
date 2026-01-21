from django.core.management.base import BaseCommand
from core.models import Module, Role

class Command(BaseCommand):
    help = 'Creates initial modules and roles'

    def handle(self, *args, **kwargs):
        # Create Modules
        modules_data = [
            {'name': 'Users', 'code': 'users', 'description': 'Manage system users'},
            {'name': 'Roles', 'code': 'roles', 'description': 'Manage system roles and permissions'},
        ]
        
        created_modules = []
        for mod_data in modules_data:
            mod, created = Module.objects.get_or_create(
                code=mod_data['code'],
                defaults={'name': mod_data['name'], 'description': mod_data['description']}
            )
            created_modules.append(mod)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created module: {mod.name}'))
            else:
                self.stdout.write(f'Module exists: {mod.name}')

        # Create Default Roles (Optional but helpful)
        # SuperUser is handled by createsuperuser or automatic logic, but we can have a basic 'Admin' role
        admin_role, created = Role.objects.get_or_create(name='Admin')
        if created:
            admin_role.modules.set(created_modules) # Give Admin access to all created modules
            admin_role.save()
            self.stdout.write(self.style.SUCCESS('Created role: Admin with full access'))
