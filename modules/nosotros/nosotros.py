from flask import Blueprint, render_template
from core.logging.logger import get_logger

nosotros_bp = Blueprint("nosotros", __name__, template_folder="templates", url_prefix="/nosotros")

@nosotros_bp.route("")
def index():
    """Display the Info page."""
    logger = get_logger()
    logger.info("📌 Página de información solicitada.")

    try:
        return render_template("pages/nosotros.html")  # ✅ Ajusta la ruta del template
    except Exception as e:
        logger.error(f"❌ ERROR en Info: {str(e)}")
        return "<h2>500 - Error interno en Info</h2>", 500
