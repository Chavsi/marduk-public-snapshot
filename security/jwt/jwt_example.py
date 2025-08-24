from flask import Blueprint, jsonify
from .jwt_handler import jwt_required

jwt_example_bp = Blueprint("jwt_example", __name__, url_prefix="/api")

@jwt_example_bp.route("/protected", methods=["GET"])
@jwt_required
def protected_example():
    return jsonify({
        "message": "✅ Acceso permitido a ruta protegida con JWT.",
        "status": "success"
    }), 200