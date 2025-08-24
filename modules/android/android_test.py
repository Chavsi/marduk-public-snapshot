from flask import Blueprint, jsonify, request
from core.utils import utc_now  # ya lo tienes en tu proyecto

test_bp = Blueprint("test", __name__, url_prefix="/test")

@test_bp.route("/hello", methods=["GET"])
def hello():
    return jsonify({
        "ok": True,
        "message": "Hello from Marduk",
        "ts_utc": utc_now().isoformat(),
        "path": request.path,
        "ua": request.headers.get("User-Agent", "")
    }), 200


@test_bp.route("/echo", methods=["POST"])
def echo():
    data = request.get_json(silent=True) or {}
    token = request.headers.get("Authorization", "")
    return jsonify({
        "ok": True,
        "received": data,
        "token": token,
        "ts_utc": utc_now().isoformat()
    }), 200
