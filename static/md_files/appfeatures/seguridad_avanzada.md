## 🔐 Seguridad Avanzada A+

**Protecciones aplicadas:**

- HTTPS forzado en todo el sitio.
- Strict-Transport-Security `max-age=63072000; includeSubDomains; preload`.
- Cookies protegidas `Secure`, `HttpOnly`, `SameSite=Strict`.
- CSRF activo en formularios, AJAX y API.
- Headers modernos:
  - Content-Security-Policy `default-src 'self'`
  - X-Content-Type-Options `nosniff`
  - X-Frame-Options `DENY`
  - Referrer-Policy `no-referrer`
  - Permissions-Policy (restricciones sobre cámara, micrófono y más)
- Gestión segura de tokens y sesiones.

## 📈 Seguridad Validada
**Resultados de pruebas externas:**

### SSL Labs 
- **Calificación: A+** (HTTPS moderno, HSTS Enabled) - <a href="https://www.ssllabs.com/ssltest/analyze.html?d=compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>

<div class="img-holder">
  <img src="/static/img/marduk/qualys_ssl_labs.png"
    alt="SSL Labs"
    class="doc-img"
    loading="lazy" decoding="async">
</div>

---
### Security Headers
- **Calificación: A+** (Headers seguros) - <a href="https://securityheaders.com/?q=https%3A%2F%2Fcompumasapp.com&followRedirects=on" target="_blank" rel="noopener noreferrer">**Ver test**</a>

<div class="img-holder">
  <img src="/static/img/marduk/security_headers.png"
      alt="Security Headers"
      class="doc-img"
      loading="lazy" decoding="async">
</div>

---
### Mozilla Observatory
- **Calificación: A+** (Estructura y configuración) - <a href="https://observatory.mozilla.org/analyze/compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>

<div class="img-holder">
  <img src="/static/img/marduk/mozilla_observatory.png"
      alt="Mozilla Observatory"
      class="doc-img"
      loading="lazy" decoding="async">
</div>

---
### Sucuri SiteCheck
- **Clasificación: Sitio limpio y sin malware** - <a href="https://sitecheck.sucuri.net/results/compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>

<div class="img-holder">
  <img src="/static/img/marduk/securi.png"
      alt="Securi"
      class="doc-img"
      loading="lazy" decoding="async">
</div>

---
### CAA Test
- **Clasificación: Política de MX 10/10 CAA válida** - <a href="https://caatest.co.uk/compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>

<div class="img-holder">
  <img src="/static/img/marduk/dns_caa_tester.png"
      alt="CAA Test"
      class="doc-img"
      loading="lazy" decoding="async">
</div>

---
### HSTS Preload
- **Estado: Sitio Incluido en preload** - <a href="https://hstspreload.org/?domain=compumasapp.com" target="_blank" rel="noopener noreferrer">**Ver test**</a>

<div class="img-holder">
  <img src="/static/img/marduk/hstspreload.png"
      alt="HSTS Preload"
      class="doc-img"
      loading="lazy" decoding="async">
</div>
---
