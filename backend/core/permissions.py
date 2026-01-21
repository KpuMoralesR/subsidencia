from rest_framework import permissions

class HasModuleAccess(permissions.BasePermission):
    """
    Custom permission to only allow access if the user's role has the required module.
    Views must define `required_module_code`.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.user.is_superuser:
            return True
            
        if not hasattr(view, 'required_module_code'):
            return True # If no module specified, allow authenticated (or handle as restricted)
            
        required_module = view.required_module_code
        if not request.user.role:
            return False
            
        return request.user.role.modules.filter(code=required_module).exists()

class RolePermission(permissions.BasePermission):
    """
    Allow read access to Roles if user has 'users' module (needed for assignment).
    Allow full access if user has 'roles' module.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.user.is_superuser:
            return True

        if not request.user.role:
            return False

        # If has 'roles' module, allow everything
        if request.user.role.modules.filter(code='ROLES').exists():
            return True
        
        # If has 'users' module, allow only safe methods (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS and request.user.role.modules.filter(code='USERS').exists():
            return True
            
        return False
