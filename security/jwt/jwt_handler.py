import jwt
from datetime import timedelta
from core.utils import utc_now
from functools import wraps
from flask import current_app, session, request, jsonify
from core.logging.logger import get_logger


# 🔒 Lista negra para tokens revocados (logout)
blacklisted_tokens = set()


def get_secret_key():
    secret = current_app.config.get("SECRET_KEY")
    if not secret:
        raise RuntimeError("❌ SECRET_KEY no está configurada. Abortando.")
    return secret

def generate_jwt(user_id):
    logger = get_logger()
    if not current_app.config.get("ENABLE_JWT", False):
        logger.warning("⚠️ Intento de generar JWT pero está deshabilitado.")
        return None

    try:
        payload = {
            "user_id": user_id,
            "exp": utc_now() + timedelta(
                hours=current_app.config.get("JWT_EXPIRATION_HOURS", 1)
            ),
            "iat": utc_now()
        }
        token = jwt.encode(payload, get_secret_key(), algorithm=current_app.config.get("JWT_ALGORITHM", "HS256"))
        logger.info(f"🎟️ JWT generado para user_id={user_id}")
        return token
    except Exception as e:
        logger.exception("❌ Error al generar JWT")
        return None

def verify_jwt(token):
    logger = get_logger()
    if token in blacklisted_tokens:
        logger.warning("🚫 Token en lista negra.")
        return None

    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[current_app.config.get("JWT_ALGORITHM", "HS256")])
        session["user_id"] = payload.get("user_id")
        session.modified = True
        logger.info(f"✅ JWT verificado correctamente para user_id={payload.get('user_id')}")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("⚠️ JWT expirado.")
    except jwt.InvalidTokenError:
        logger.warning("⚠️ JWT inválido.")
    except Exception as e:
        logger.exception("❌ Error inesperado al verificar JWT.")
    return None

def blacklist_token(token):
    logger = get_logger()
    blacklisted_tokens.add(token)
    logger.info(f"🚫 JWT revocado: {token[:25]}...")

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "❌ Token JWT no proporcionado"}), 401

        token = auth_header.replace("Bearer ", "").strip()
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "❌ Token JWT inválido o expirado"}), 401

        return f(*args, **kwargs)
    return decorated