from flask import Blueprint
from .jwt import jwt_bp, generate, verify
from .jwt_example import jwt_example_bp, protected_example

jwt_api_bp = Blueprint("jwt_api", __name__)

jwt_api_bp.register_blueprint(jwt_bp)
jwt_api_bp.register_blueprint(jwt_example_bp)

__all__ = ["jwt_bp", "jwt_example_bp", "protected_example", "generate", "verify"]

