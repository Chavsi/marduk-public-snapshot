from flask import Blueprint, render_template
from core.logging import get_logger

info_bp = Blueprint("info", __name__, template_folder="templates", url_prefix="/info")

@info_bp.route("/index")
def index():
    """Display the Info page."""
    logger = get_logger()
    logger.info("📌 Página de información solicitada.")

    try:
        return render_template("pages/info.html")  # ✅ Ajusta la ruta del template
    except Exception as e:
        logger.error(f"❌ ERROR en Info: {str(e)}")
        return "<h2>500 - Error interno en Info</h2>", 500
