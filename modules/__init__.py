# C:\web_project2\modules\__init__.py
from flask import Flask
from core.logging.logger import get_logger
from .home import home_bp
from .info import info_bp
from .nosotros import nosotros_bp
from .landing import landing_bp
from .quickboard import quickboard_bp
from .md_services import mdviewer_bp
from .botfriendly import bot_bp
from .md_appfeatures import appfeatures_bp
from .android.android_test import test_bp


all_blueprints = [
    home_bp,
    info_bp,
    nosotros_bp,
    landing_bp,
    quickboard_bp,
    mdviewer_bp,
    bot_bp,
    appfeatures_bp,
    test_bp
]

def init_modules(app: Flask):
    """🔹 Registra TODOS los Blueprints de `modules` en la aplicación Flask."""
    logger = get_logger()
    for bp in all_blueprints:
        app.register_blueprint(bp)
        #logger.debug(f"✅ Blueprint `{bp.name}` registrado correctamente.")

    logger.info("\n✅ TODOS LOS BLUEPRINTS DE `modules` REGISTRADOS \n")

__all__ = ["init_modules", "all_blueprints"]

