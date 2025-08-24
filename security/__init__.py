from flask import Flask
from core.logging.logger import get_logger
from .auth_middleware import init_session
from .csrf import csrf_bp, set_csrf_cookie, check_csrf_token, ensure_csrf_token
from .jwt import jwt_api_bp
from .session_ping import session_ping_bp
from .login_manager import login_manager
from .auth_validators import check_authentication
from .masking import mask_sensitive

def init_security(app: Flask):
    """🔒 Inicializa todos los módulos de seguridad en la aplicación Flask."""
    logger = get_logger()
    logger.info("🔒 Inicializando módulos de seguridad...")

    # ✅ **Registrar Blueprints**
    blueprints = {
        "csrf_bp": csrf_bp,
        "jwt_api_bp": jwt_api_bp,
        "session_ping": session_ping_bp
    }

    for name, bp in blueprints.items():
        if name not in app.blueprints:
            app.register_blueprint(bp)
            #logger.debug(f"✅ Blueprint `{name}` registrado correctamente.")

    # ✅ **Inicializar `LoginManager` si aún no está en la app**
    if not hasattr(app, "login_manager"):
        login_manager.init_app(app)
        app.login_manager = login_manager
        logger.info("✅ LoginManager inicializado.")

    logger.info("✅ Módulo SECURITY inicializado correctamente.")

# 🔹 Exponer elementos reutilizables
__all__ = [
    "init_security",
    "init_session",
    "csrf_bp",
    "jwt_api_bp",
    "session_ping_bp",
    "login_manager",
    "check_csrf_token",
    "check_authentication",
    "set_csrf_cookie",
    "ensure_csrf_token",
    "mask_sensitive"  
]
