from flask import request, session, jsonify
from flask_wtf.csrf import generate_csrf
from core.utils import utc_now
from core.logging.logger import get_logger, log_to_db
import hmac


def check_csrf_token():
    """Verifica si el CSRF token enviado coincide con el de la sesión."""
    logger = get_logger()

    # 🚀 Solo validar si la petición es POST, PUT, DELETE
    if request.method in ["POST", "PUT", "DELETE"]:
        csrf_token_sent = (
            request.headers.get("X-CSRFToken") or
            request.form.get("csrf_token") or
            request.args.get("csrf_token")
        )
        
        csrf_token_session = session.get("_csrf_token")
        user_ip = request.remote_addr
        user_agent = request.headers.get("User-Agent")
        
        if not csrf_token_session:
            logger.debug("❌ No hay un CSRF token en la sesión. La solicitud será rechazada.")
            logger.warning("❌ No hay un CSRF token en la sesión. La solicitud será rechazada.")
            log_to_db(
                "WARNING",
                f"❌ CSRF ausente en sesión. Método: {request.method} | IP={user_ip} | UA={user_agent}",
                module="security.csrf"
            )
            return jsonify({"error": "❌ No hay un CSRF token en la sesión"}), 400

        if not csrf_token_sent:
            logger.warning("❌ CSRF Token no fue enviado en la solicitud.")
            log_to_db(
                "WARNING",
                f"❌ CSRF ausente en sesión. Método: {request.method} | IP={user_ip} | UA={user_agent}",
                module="security.csrf"
            )
            return jsonify({"error": "❌ CSRF Token no enviado"}), 400

        if not hmac.compare_digest(csrf_token_sent, csrf_token_session):
            logger.warning(f"❌ CSRF Token inválido. Enviado: {csrf_token_sent}, Esperado: {csrf_token_session}")
            log_to_db(
                "WARNING",
                f"❌ CSRF Token inválido. IP={user_ip} | UA={user_agent}",
                module="security.csrf"
            )
            return jsonify({"error": "❌ CSRF Token inválido"}), 400

    return None

def ensure_csrf_token():
    """
    Asegura que exista un token CSRF válido en la sesión y devuelve el valor del token.
    """
    if "_csrf_token" not in session:
        session["_csrf_token"] = generate_csrf()
        session["_csrf_issued_at"] = utc_now().timestamp()
    return session["_csrf_token"]
