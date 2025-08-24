# C:\web_project2\security\login_manager.py

from flask_login import LoginManager
from core.models.user import User
from core.logging.logger import get_logger
from config.utils import get_config  # ✅ Importas tu función segura
from core.database.db import db

login_manager = LoginManager()

def init_login_manager(app):
    """Inicializa Flask-Login y gestiona la sesión de usuarios."""
    logger = get_logger()
    global login_manager

    # ⚠️ Validaciones de configuración necesarias
    assert get_config("SESSION_PROTECTION") is not None, "❌ Falta configurar SESSION_PROTECTION"
    assert get_config("REMEMBER_COOKIE_DURATION") is not None, "❌ Falta configurar REMEMBER_COOKIE_DURATION"

    login_manager.login_view = "/"
    login_manager.session_protection = get_config("SESSION_PROTECTION")
    login_manager.remember_cookie_duration = get_config("REMEMBER_COOKIE_DURATION")
    login_manager.init_app(app)
    logger.info("✅ LoginManager inicializado correctamente.")

@login_manager.user_loader
def load_user(user_id):
    """Carga el usuario desde la base de datos por ID después de la autenticación."""
    logger = get_logger()
    if not user_id:
        logger.warning("⚠ `user_id` es None. Flask-Login no pudo recuperar el usuario.")
        return None
    try:
        return db.session.get(User, int(user_id))
    except Exception:
        return None
