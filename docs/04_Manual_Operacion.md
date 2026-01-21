# 04. Manual de Operación

## Mantenimiento Diario
- Verificar estado de servicios (systemctl status nginx/gunicorn).
- Revisar logs de errores en `/var/log/`.

## Respaldo (Backup)
Se recomienda respaldo diario de la base de datos PostgreSQL:
```bash
pg_dump base > backup_$(date +%F).sql
```

## Gestión de Módulos

### Crear Nuevo Módulo
Para agregar un nuevo módulo al sistema RBAC:

```bash
python backend/create_module.py --code NOMBRE_MODULO --name "Nombre Visible" --desc "Descripción"
```

**Parámetros**:
- `--code`: Código único en MAYÚSCULAS (ej. HELLO, REPORTS)
- `--name`: Nombre visible del módulo
- `--desc`: Descripción opcional

**Ejemplo**:
```bash
python backend/create_module.py --code ANALYTICS --name "Analíticas" --desc "Módulo de análisis de datos"
```

> **Nota**: El módulo se asigna automáticamente al rol Superadmin. Para otros roles, usar la interfaz web de gestión de roles.

## Solución de Problemas
**Error: "Connection refused"**
- Verificar que PostgreSQL esté corriendo en puerto 5432.
- Verificar credenciales en `settings.py`.

**Error: "CORS Network Error"**
- Verificar que Backend esté corriendo en puerto 8000.

**Error: "NameError: name 'APIView' is not defined"**
- Verificar imports en `views.py`: `from rest_framework.views import APIView`

**Error 403 en módulo nuevo**
- Verificar que el código del módulo esté en MAYÚSCULAS
- Verificar que el usuario tenga el módulo asignado en su rol

