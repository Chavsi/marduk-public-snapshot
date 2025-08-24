# C:\web_project2\security\csrf\csrf.py
from flask import Blueprint, jsonify, session, request
from flask_wtf.csrf import generate_csrf
from core.logging.logger import get_logger
from config.utils import get_config
from core.utils import utc_now


csrf_bp = Blueprint("csrf", __name__, url_prefix="/csrf")


@csrf_bp.route("/get", methods=["GET"])
def get_csrf():
    """🔒 Devuelve el CSRF token si la sesión es válida y lo genera solo si no existe."""
    logger = get_logger()
    
    if request.headers.get("X-Requested-With") != "XMLHttpRequest":
        logger.warning("🔒 /csrf/get accedido sin cabecera AJAX — intento externo.")
        return jsonify({"error": "🔒 Acceso no permitido"}), 403

    # ✅ Evita crear sesión si no existe aún
    if not request.cookies.get(get_config("SESSION_COOKIE_NAME")):
        logger.warning("🚫 /csrf/get accedido sin cookie de sesión previa.")
        return jsonify({"error": "🚫 No session cookie set"}), 403

    # 🔒 Verifica el origen permitido
    allowed_origin = get_config("ALLOWED_ORIGIN_DOMAIN")
    origin = request.headers.get("Origin")

    # 🔄 Soporta string o lista
    if origin and (
        isinstance(allowed_origin, str) and allowed_origin not in origin or
        isinstance(allowed_origin, list) and not any(o in origin for o in allowed_origin)
    ):
        logger.warning(f"🔒 Origen no permitido: {origin}")
        return jsonify({"error": "🔒 Origen no permitido"}), 403

    user_ip = request.remote_addr or "IP desconocida"
    user_agent = request.headers.get("User-Agent", "User-Agent desconocido")

    csrf_token = session.get("_csrf_token")
    
    if not csrf_token:
        csrf_token = generate_csrf()
        session["_csrf_token"] = csrf_token
        session["_csrf_issued_at"] = utc_now().timestamp()
        session.modified = True
        logger.info("🛡️ Nuevo CSRF token generado.")
    else:
        logger.debug(f"✅ Token CSRF ya existente: {csrf_token}")

    logger.info(f"🌐 IP: {user_ip} | 📱 UA: {user_agent}")

    return jsonify({"csrf_token": csrf_token})
