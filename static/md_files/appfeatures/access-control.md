### 🚪 Seguridad en Rutas y Recursos

**Protección de rutas y flujos:**

- Autenticación obligatoria en rutas protegidas
- Validación automática de sesión en cada request
- Exclusión de rutas públicas desde `config.PUBLIC_ROUTES`
- Middleware central para verificar CSRF, tokens, y acceso
- Soporte para logging y trazabilidad de accesos
