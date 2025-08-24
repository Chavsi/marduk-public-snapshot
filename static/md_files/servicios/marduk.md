### 🌌 Marduk Secure Web App for Database Deployment

Nuestro sitio web compumasapp.com opera con nuestro core app denominado Marduk.

Marduk ha sido diseñado con una arquitectura modular, segura, moderna y expansible, cumpliendo estándares internacionales de seguridad web.  
Actualmente supera en buenas prácticas a numerosos sitios comerciales, institucionales y financieros de mediana escala en Ecuador y América Latina.

Gracias a esto, nuestro sitio web califica como un sitio seguro con nivel Tier 1 Internacional.

---

#### 🛠️ Arquitectura e infraestructura general:

- Backend: Python (Flask) + SQLAlchemy.
- Base de datos: PostgreSQL con conexiones seguras SSL (Railway).
- Frontend: HTML5, CSS3 modular, JavaScript vanilla.
- Infraestructura: Linux (Ubuntu WSL2), Railway, Cloudflare (DNS + Proxy + WAF).

---

#### 🛡️ Capacidades de Comunicación Soportadas
- ✅ **HTML clásico**: navegación y formularios seguros mediante renderizado de plantillas.
- ✅ **AJAX seguro**: soporte para solicitudes asíncronas autenticadas con tokens CSRF.
- ✅ **API REST básica**: soporte para endpoints que reciben y responden JSON estructurado.
- ✅ **Protección adicional**: detección de User-Agent, IP, control de sesión y flujos separados.
- ✅ **Cloudflare WAF**: capa de seguridad perimetral adicional para tráfico web y API.
- ✅ **Roadmap técnico**:
  - Soporte avanzado para `Accept` headers (negociación de contenido flexible).
  - Versionado de API REST (`/api/v1/`) para futuras integraciones externas.

---

#### 🔐 Estado Actual de Seguridad de CompuMásApp.com

**Protecciones aplicadas:**

- ✅ HTTPS forzado en todo el sitio (Always Use HTTPS).
- ✅ Strict-Transport-Security activo (`max-age=63072000; includeSubDomains; preload`).
- ✅ Dominio registrado en HSTS Preload List (pendiente de inclusión).
- ✅ Cookies protegidas (`Secure`, `HttpOnly`, `SameSite=Strict`).
- ✅ Protección activa contra CSRF (Cross-Site Request Forgery).
- ✅ Headers de seguridad modernos:
  - Content-Security-Policy estricta (`default-src 'self'`).
  - X-Content-Type-Options (`nosniff`).
  - X-Frame-Options (`DENY`).
  - Referrer-Policy (`no-referrer`).
  - Permissions-Policy (control de geolocalización, micrófono y cámara).
- ✅ Sesiones protegidas y administración segura de tokens.

---

#### 📈 Resultados en evaluaciones externas:

- SSL Labs - **Calificación: A+** (SSL/TLS moderno y válido, HSTS Pending) - <a href="https://www.ssllabs.com/ssltest/analyze.html?d=compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>
- Security Headers - **Calificación: A+** (headers de seguridad correctamente configurados) - <a href="https://securityheaders.com/?q=https%3A%2F%2Fcompumasapp.com&followRedirects=on" target="_blank" rel="noopener noreferrer">**Ver test**</a>
- Mozilla Observatory - **Calificación: A+** (estructura segura) - <a href="https://observatory.mozilla.org/analyze/compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>
- Hardenize - **Estado: Sin vulnerabilidades críticas detectadas** - <a href="https://www.hardenize.com/report/compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>
- Sucuri SiteCheck - **Clasificación: Sitio limpio y seguro** - <a href="https://sitecheck.sucuri.net/results/compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>
- CAA Test - Clasificación: **Política CAA válida** - <a href="https://caatest.co.uk/?domain=compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>
- HSTS Preload - Estado: **Inclusión Pending** - <a href="https://hstspreload.org/?domain=compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>

---

#### 🎯 Resumen de Seguridad Aplicada

- ✅ SSL/TLS activo - Full strict chain.
- ✅ HTTPS forzado en todo el sitio.
- ✅ Strict-Transport-Security activo (Flask y Cloudflare) + HSTS Preload enviado.
- ✅ Cookies protegidas (Secure, HttpOnly, SameSite=Strict).
- ✅ Protección avanzada contra CSRF (Cross-Site Request Forgery).
- ✅ Headers de seguridad modernos aplicados:
  - Content-Security-Policy (CSP)
  - Referrer-Policy
  - Permissions-Policy
  - X-Frame-Options
  - X-Content-Type-Options
- ✅ Sesiones protegidas y gestión segura de tokens.

---

**🌀 Powered by Marduk • Built with Wisdom and Passion.**
