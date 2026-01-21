# Matriz de Riesgos

| ID | Riesgo | Probabilidad (1-5) | Impacto (1-5) | Severidad (P*I) | Estrategia |
|----|--------|-------------------|---------------|-----------------|------------|
| R1 | Pérdida de Datos | 2 | 5 | 10 (Alto) | Backups Automáticos |
| R2 | Acceso no autorizado | 2 | 5 | 10 (Alto) | RBAC + MFA (Roadmap) |
| R3 | Caída del servicio | 3 | 4 | 12 (Alto) | Balanceo de Carga (Roadmap) |
| R4 | Bugs en Frontend | 3 | 2 | 6 (Medio) | Tests E2E / Unitarios |
| R5 | Dependencias Obsoletas | 4 | 3 | 12 (Alto) | Actualización periódica (Node 16 es riesgo actual) |
