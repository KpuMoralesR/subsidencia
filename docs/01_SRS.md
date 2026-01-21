# 01. Specification Requirements System (SRS)

**Proyecto:** BaseDR (Django + React Secure Base)
**Versión:** 1.0.0
**Fecha:** 21/01/2026

## 1. Introducción
### 1.1 Propósito
El propósito de este documento es definir los requisitos funcionales y no funcionales para el sistema "BaseDR", una plataforma web segura basada en Django y React.

### 1.2 Alcance
El sistema permite la gestión de usuarios y roles con control de acceso granular (RBAC). Incluye un backend robusto en Django Rest Framework y un frontend moderno en React con TailwindCSS.

## 2. Descripción General
### 2.1 Perspectiva del Producto
BaseDR actúa como un esqueleto "Premium" para aplicaciones empresariales, garantizando seguridad desde el diseño.

### 2.2 Características del Usuario
- **Superadmin:** Acceso total al sistema.
- **Administrador:** Gestión de usuarios y roles según permisos.
- **Usuario:** Acceso limitado a su dashboard.

## 3. Requisitos Funcionales
### 3.1 Módulo de Autenticación
- **RF-01:** El sistema debe permitir login con usuario y contraseña.
- **RF-02:** El sistema debe bloquear accesos no autorizados mediante Tokens/Sesión.

### 3.2 Módulo de Usuarios
- **RF-03:** Crear, Leer, Actualizar y Eliminar (CRUD) usuarios.
- **RF-04:** Asignar roles a usuarios.

### 3.3 Módulo de Roles
- **RF-05:** Gestión dinámica de roles.
- **RF-06:** Asignación de módulos permitidos a cada rol.

## 4. Requisitos No Funcionales
- **RNF-01 Seguridad:** Contraseñas hasheadas (PBKDF2).
- **RNF-02 Interfaz:** Diseño Responsivo y "Premium" (Tailwind).
- **RNF-03 Base de Datos:** PostgreSQL 12+.

---
*Este documento es parte de la entrega oficial de BaseDR.*
