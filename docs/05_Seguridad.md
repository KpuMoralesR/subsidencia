# 05. Seguridad

**Proyecto:** BaseDR
**Nivel de Clasificación:** Confidencial / Uso Interno

## 1. Principios de Seguridad
El sistema ha sido diseñado bajo la filosofía "Secure by Design".

### 1.1 Autenticación
- **Mecanismo:** Django Auth System.
- **Almacenamiento:** Algoritmo PBKDF2 con SHA256 para hashing de contraseñas.
- **Protección:** Middleware CSRF y CORS configurado estrictamente.

### 1.2 Autorización (RBAC)
Se implementa un control de acceso basado en Roles y Módulos.
- **Backend:** Clase `HasModuleAccess` en DRF valida que el rol del usuario tenga acceso al módulo solicitado.
- **Frontend:** `ProtectedRoute` y renderizado condicional ocultan elementos no autorizados.

## 2. Análisis de Riesgos (Resumen)
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Inyección SQL | Baja | Crítico | Uso de Django ORM (Parameterization). |
| XSS | Media | Alto | Escapado automático de React y Django Templates. |
| Fuerza Bruta | Media | Medio | Recomendación: Implementar Rate Limiting (Pendiente). |

## 3. Configuración de Seguridad Implementada
- **DEBUG:** `True` (Solo Desarrollo - *Debe cambiarse a False en Prod*).
- **ALLOWED_HOSTS:** Configurado para entorno local.
- **CORS:** `CORS_ALLOW_ALL_ORIGINS = True` (Solo Desarrollo).

> [!WARNING]
> Antes del despliegue en producción, se deben ajustar las variables de entorno para desactivar el modo debug y restringir orígenes CORS.

## 4. Evidencia de Capturas
Se han verificado los flujos de seguridad mediante pruebas manuales y automatizadas.
Ver `/docs/capturas/login_usuario.png`.
