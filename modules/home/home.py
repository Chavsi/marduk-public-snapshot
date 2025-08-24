from flask import Blueprint, redirect, url_for, jsonify, request
from flask_login import current_user

home_bp = Blueprint("home", __name__)

@home_bp.route("/")
def index():
    """🔍 Redirige según autenticación."""
    if current_user.is_authenticated:
        destino = url_for("quickboard.index")
    else:
        destino = url_for("landing.index")

    # AJAX
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify({"authenticated": current_user.is_authenticated, "redirect": destino})

    return redirect(destino)



