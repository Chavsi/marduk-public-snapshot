from flask import Blueprint, session, jsonify, current_app
from core.logging.logger import get_logger
import time, secrets
from config.utils import get_config

session_ping_bp = Blueprint("session_ping", __name__, url_prefix="/session")

def _maybe_refresh_csrf(resp):
    ttl    = get_config("CSRF_TOKEN_TTL", cast=int)
    now    = time.time()

    token     = session.get("_csrf_token")
    issued_at = session.get("_csrf_issued_at")

    if not token or not issued_at:
        session["_csrf_token"] = secrets.token_urlsafe(32)
        session["_csrf_issued_at"] = now
        session["_csrf_cookie_dirty"] = True 
        session.modified = True
    else:
        age = now - issued_at
        if age >= ttl * 0.75:           # sliding refresh al 75%
            session["_csrf_issued_at"] = now
            session["_csrf_cookie_dirty"] = True
            session.modified = True

    # ⬅️ Nada de resp.set_cookie aquí. Lo hará after_request.
    return resp

@session_ping_bp.route("/ping", methods=["GET"])
def ping_session():
    """🫧 Ruta neutra para crear sesión sin exponer datos."""
    logger = get_logger()
    # Forzar creación de sesión sin exponer contenido
    session.modified = True
    logger.debug("🫧 Ping recibido → Sesión marcada como modificada.")
    resp = jsonify({"status": "ok", "session_initialized": True})
    return _maybe_refresh_csrf(resp)
