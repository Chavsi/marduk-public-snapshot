# C:\web_project2\security\auth_validators.py
from flask import request, redirect, url_for, jsonify
from flask_login import current_user
from core.logging.logger import get_logger, log_to_db
from config.utils import get_config


def check_authentication():
    """🔒 Controla acceso a páginas protegidas y permite acceso a rutas públicas."""
    logger = get_logger()

    endpoint = request.endpoint
    if not endpoint:
        logger.debug("⚠ `request.endpoint` es None. No se verificará autenticación.")
        return

    # ✅ Ignorar archivos estáticos (incluye static de blueprints)
    if endpoint == "static" or endpoint.endswith(".static"):
        return

    # 🔹 Rutas públicas permitidas sin autenticación
    allowed_routes = set(get_config("PUBLIC_ROUTES", cast=list))
    if get_config("DEBUG", cast=bool):
        allowed_routes |= set(get_config("DEBUG_ROUTES", cast=list))

    # 🔐 Rutas protegidas con JWT (saltan sesión)
    jwt_enabled = get_config("ENABLE_JWT", cast=bool)
    jwt_routes  = set(get_config("JWT_PROTECTED_ROUTES", cast=list))
    
    if endpoint in jwt_routes:
        if not jwt_enabled:
            logger.warning(f"⚠️ Ruta JWT `{endpoint}` fue accedida pero JWT está deshabilitado.")
            log_to_db("WARNING",
                      f"⚠️ Ruta JWT deshabilitada accedida: {endpoint} | IP={request.remote_addr}",
                      module="security.jwt")
            return jsonify({"error": "🔒 JWT deshabilitado en configuración"}), 403

        logger.debug(f"🛡️ Ruta JWT detectada: {endpoint} → omitiendo verificación de sesión Flask.")
        # aquí podrías invocar tu validador JWT si lo tienes (p.ej., validate_jwt())
        return

    logger.debug(f"🔍 Verificando acceso: endpoint={endpoint}, user_authenticated={current_user.is_authenticated}")

    LOGIN_ENDPOINTS = ("auth.login.login", "auth.register.register")

    # 🔄 Redirigir a Dashboard si el usuario ya está autenticado y accede a Login o Register
    if current_user.is_authenticated and endpoint in LOGIN_ENDPOINTS:
        logger.info(f"🔄 Usuario autenticado intentó acceder a '{endpoint}', redirigiendo según rol.")
        log_to_db(
            "INFO",
            f"🔄 Usuario autenticado intentó acceder a `{endpoint}` — redirigido.",
            module="security.auth_flow",
            user=getattr(current_user, "username", None)
        )

        user_role = getattr(getattr(current_user, "role", None), "value", None)
        if user_role == "admin":
            return redirect(url_for("admin.adminboard_index"))
        else:
            return redirect(url_for("quickboard.index"))

    # 🔒 Si el usuario no está autenticado y la ruta no está permitida, redirigir a login
    if not current_user.is_authenticated and endpoint not in allowed_routes:
        ip = request.remote_addr
        ua = request.headers.get("User-Agent")
        logger.warning(f"🔒 Intento de acceso bloqueado a '{endpoint}' desde {request.remote_addr} | Usuario no autenticado")
        
        log_to_db(
            "WARNING",
            f"🔒 Intento no autenticado a `{endpoint}` | IP={ip} | UA={ua}",
            module="security.auth_block"
        )
        
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return jsonify({"error": "🔒 No autenticado"}), 401
        return redirect(url_for("auth.login.login"))
