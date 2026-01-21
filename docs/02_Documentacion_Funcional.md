# 02. Documentación Funcional

## Arquitectura del Sistema
El sistema sigue el patrón Modelo-Vista-Controlador (MVC) adaptado a una arquitectura de API REST:
- **Backend:** Django (Modelos) + DRF (Serializadores/Vistas).
- **Frontend:** React (Vite) consumiendo API.
- **Base de Datos:** PostgreSQL.

## Flujos de Datos
1. **Login:** Frontend envía credenciales -> Backend verifica (AbstractUser) -> Retorna Token/Sesión.
2. **Dashboard:** Frontend solicita `/api/users/` -> Backend verifica `HasModuleAccess` -> Retorna JSON.

## Modelos de Datos
### User (Extends AbstractUser)
- `username`: String
- `role`: ForeignKey(Role)

### Role
- `name`: String
- `modules`: ManyToMany(Module)

### Module
- `name`: String
- `code`: String (identificador único para permisos)
