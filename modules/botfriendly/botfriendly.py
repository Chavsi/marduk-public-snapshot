from flask import Blueprint, render_template, request
from core.logging.logger import get_logger

logger = get_logger()

bot_bp = Blueprint("botfriendly", __name__, url_prefix="/bot")

@bot_bp.route("/landing")
def bots_landing():
    user_agent = request.headers.get("User-Agent", "desconocido")
    logger.info(f"🤖 Acceso bot: {user_agent}")
    return render_template("botfriendly/bots_landing.html")
