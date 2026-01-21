# Threat Model

**Metodología:** STRIDE

1. **Spoofing (Suplantación):**
   - Riesgo: Atacante roba credenciales de admin.
   - Mitigación: Hashing fuerte, recomendación de MFA.

2. **Tampering (Manipulación):**
   - Riesgo: Modificación de permisos en BD.
   - Mitigación: Acceso a BD restringido a localhost/VPN.

3. **Repudiation:**
   - Riesgo: Usuario niega haber borrado un registro.
   - Mitigación: Logs de Django (Admin Log).

4. **Information Disclosure:**
   - Riesgo: Error 500 revela stacktrace.
   - Mitigación: `DEBUG=False` en producción.

5. **Denial of Service:**
   - Riesgo: Ataque a API.
   - Mitigación: Rate Limiting en Nginx/DRF.

6. **Elevation of Privilege:**
   - Riesgo: Usuario normal accede a panel de Roles.
   - Mitigación: Permiso `HasModuleAccess` validado en cada request.
