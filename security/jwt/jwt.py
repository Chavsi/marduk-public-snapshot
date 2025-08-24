from flask import Blueprint, request, jsonify
from .jwt_handler import generate_jwt, verify_jwt, blacklist_token
from core.logging.logger import get_logger


jwt_bp = Blueprint("jwt", __name__, url_prefix="/jwt")


@jwt_bp.route("/generate", methods=["POST"])
def generate():
    logger = get_logger()
    user_ip = request.remote_addr or "IP desconocida"
    user_agent = request.headers.get("User-Agent", "User-Agent desconocido")

    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        logger.warning("❌ user_id no proporcionado en /jwt/generate")
        logger.info(f"🌐 IP: {user_ip} | 📱 UA: {user_agent}")
        return jsonify({"error": "❌ user_id requerido"}), 400

    token = generate_jwt(user_id)
    logger.info(f"🎫 JWT generado para user_id={user_id}")
    logger.debug(f"🔐 Token: {token[:40]}...")
    logger.info(f"🌐 IP: {user_ip} | 📱 UA: {user_agent}")

    return jsonify({"token": token}), 200

@jwt_bp.route("/verify", methods=["GET"])
def verify():
    logger = get_logger()
    user_ip = request.remote_addr or "IP desconocida"
    user_agent = request.headers.get("User-Agent", "User-Agent desconocido")

    data = request.get_json(silent=True) or {}
    token = data.get("token")

    if not token:
        logger.warning("❌ Token no proporcionado en /jwt/verify")
        logger.info(f"🌐 IP: {user_ip} | 📱 UA: {user_agent}")
        return jsonify({"error": "❌ Se requiere un token"}), 400

    payload = verify_jwt(token)
    if payload:
        logger.info("✅ Token JWT verificado con éxito")
        logger.debug(f"📦 Payload: {payload}")
        logger.info(f"🌐 IP: {user_ip} | 📱 UA: {user_agent}")
        return jsonify({"valid": True, "data": payload}), 200

    logger.warning("❌ Token JWT inválido o expirado")
    logger.info(f"🌐 IP: {user_ip} | 📱 UA: {user_agent}")
    return jsonify({"valid": False, "error": "Token inválido o expirado"}), 401
