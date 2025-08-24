from flask import Blueprint, render_template
from flask_login import current_user
from core.logging.logger import get_logger 

landing_bp = Blueprint("landing", __name__, template_folder="templates", url_prefix="/landing")

@landing_bp.route("")
def index():
    """Landing page accesible para todos, incluyendo usuarios logueados"""
    logger = get_logger()
    logger.info(f"Acceso a Landing - Usuario: {current_user.username if current_user.is_authenticated else 'Anónimo'}")
    return render_template("pages/landing.html", current_user=current_user)

