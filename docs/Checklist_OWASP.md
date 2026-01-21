# Checklist OWASP Top 10 (2021)

- [x] **A01: Broken Access Control:** Implementado RBAC estricto en API.
- [x] **A02: Cryptographic Failures:** Contraseñas hasheadas, HTTPS requerido en prod.
- [x] **A03: Injection:** Django ORM previene SQL Injection por defecto.
- [x] **A04: Insecure Design:** Validaciones de negocio en backend.
- [x] **A05: Security Misconfiguration:** Guía de despliegue especifica desactivar DEBUG.
- [x] **A06: Vulnerable Components:** Dependencias gestionadas via pip/npm. (Nota: Node 16 es riesgo aceptado por entorno legacy).
- [x] **A07: Identification and Authentication Failures:** Auth estándar de Django.
- [x] **A08: Software and Data Integrity Failures:** Firmas digitales (no aplica scope actual).
- [x] **A09: Security Logging and Monitoring:** Logs básicos de Django.
- [x] **A10: Server-Side Request Forgery:** No se realizan peticiones externas desde backend.
