from core.logging.logger import get_logger

# ✅ Aplicar Seguridad a Todas las Respuestas
def init_security_headers(app):
    logger = get_logger()
    
    if app.debug:
        logger.info("🔧 Headers para DEVELOPMENT activados (Cache-Control, sin políticas CSP)")
        @app.after_request
        def add_dev_headers(response):
            # Solo agregar headers para DEV, sin tocar políticas de seguridad avanzadas
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response
    else:
        logger.info("🛡️ Headers de PRODUCCIÓN activados, seguridad estricta")
        logger.info("🛡️ CSP, HSTS, XSS-Protection, Frame Options")
        logger.info("🛡️ MIME Sniffing, Referrer Policy, Permissions Policy.")

        @app.after_request
        def add_security_headers(response):
            # Solo aplicar seguridad estricta si NO estamos en debug
            # 🛡️ Previene detección automática de tipo MIME
            response.headers["X-Content-Type-Options"] = "nosniff"
            # 🛡️ Previene que el sitio sea embebido en iframes (clickjacking)
            # Usa SAMEORIGIN si embebes partes de tu propio sitio (ej. dashboards internos)
            # Usa DENY si no usas iframes en absoluto (mayor seguridad)
            response.headers["X-Frame-Options"] = "DENY"
            # 🛡️ Previene ataques XSS (Cross-Site Scripting)
            # Controla qué fuentes de scripts, estilos e imágenes pueden cargarse
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; " 
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "object-src 'none'; "
                "img-src 'self' data:; "
                "base-uri 'none'; "
                "frame-ancestors 'none'; "
            )
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
            response.headers["Referrer-Policy"] = "no-referrer"
            response.headers["Permissions-Policy"] = "geolocation=(self), microphone=(), camera=()"
            # 🧪 Opcionales (solo si usas WebAssembly, PDF.js, SharedArrayBuffer, etc.)
            # response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
            # response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
            return response
