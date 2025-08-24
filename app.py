from flask import Flask, send_from_directory, session
from datetime import datetime
from config import AppConfig
from core.database.db import init_app
#from core.database.db import db
from core.logging.logger import init_logging, get_logger
from security import init_security, init_session
from core import init_core
#from core.errors import init_errors
#from core.database.migrations import init_migrations
from company import init_company
from modules import init_modules
from core.mailer.mailer import init_mail
from admin import init_admin
from assets import init_assets
from security.headers import init_security_headers
from flask_login import current_user
from company.services import get_empresa_nombre
from core.roles.services import has_role
#import os
from core.seeds.run_base_model_seeds import run_base_seeds


def mask(value, show=4):
    """Oculta parcialmente valores sensibles."""
    if not isinstance(value, str) or len(value) <= show:
        return "****"
    return f"{value[:show]}{'*' * (len(value) - show)}"

# ✅ Crear aplicación
def create_app():
    logger = get_logger()
    app = Flask(__name__, static_folder=None, template_folder="templates")
    app.config.from_object(AppConfig)

    app.config.setdefault("SEND_FILE_MAX_AGE_DEFAULT", 31536000)

    with app.app_context():
        # ✅ Depuración de Configuración
        logger.info("\n" + "=" * 50)
        logger.info("🔍 CONFIGURACIÓN APLICADA")
        logger.info("=" * 50)

    all_keys = [
        "DEBUG",
        "WTF_CSRF_ENABLED",
        "USE_SSL",
        "SECRET_KEY",
        "SESSION_COOKIE_SAMESITE", #### no se usaban en app_dev
        "SESSION_COOKIE_NAME",
        "SESSION_COOKIE_SECURE",
        "SESSION_PERMANENT", #### no se usaban en app_dev
        "PERMANENT_SESSION_LIFETIME",
        "CSRF_COOKIE_NAME",
        "CSRF_COOKIE_SAMESITE", #### no se usaban en app_dev
        "CSRF_COOKIE_SECURE",
        "FLASK_HOST",
        "FLASK_PORT",
        "CSRF_EXEMPT_ENDPOINTS",
        "ALLOWED_ORIGIN_DOMAIN",
    ]
    
    for key in all_keys:
        val = app.config.get(key)
        val = mask(val) if key in ["SECRET_KEY"] else val
        logger.info(f"    {key}: {val}")

    logger.info(f"🛠️  Flask escuchará en {app.config['FLASK_HOST']}:{app.config['FLASK_PORT']}")

    if app.config.get("SQLALCHEMY_DATABASE_URI"):
        uri = app.config["SQLALCHEMY_DATABASE_URI"]
        logger.info(f"🗃️  DB Principal: {mask(uri, 12)}")

    if "SQLALCHEMY_BINDS" in app.config:
        logger.info("🔗 Binds activos:")
        for bind, uri in app.config["SQLALCHEMY_BINDS"].items():
            logger.info(f"    - {bind}: {mask(uri, 12)}")

    # ✅ Verificar si SSL está habilitado
    if app.config["USE_SSL"]:
        logger.info(f"🔒 SSL habilitado con Certificado: {app.config['SSL_CERT_FILE']} y Clave: {app.config['SSL_KEY_FILE']}")

    logger.info("=" * 50 + "\n")

    # ✅ Verificar configuración de Mail
    logger.debug("📨 MAIL CONFIGURATION")
    try:
        mail_keys = [
            "MAIL_SERVER",
            "MAIL_PORT",
            "MAIL_USE_SSL",
            "MAIL_USERNAME",
            "MAIL_DEFAULT_SENDER",
            "MAIL_ADMIN_ALERT"
        ]

        for key in mail_keys:
            val = app.config.get(key)
            val = mask(val) if "PASSWORD" in key or "USERNAME" in key or "SENDER" in key else val
            logger.info(f"    {key}: {val}")
    except Exception as e:
        logger.warning(f"⚠️ Error al obtener configuración de mail: {e}")
    init_app(app)
    init_logging(app)
    init_security(app)
    init_session(app)
    init_core(app)
    #init_errors(app)
    
    with app.app_context():
        run_base_seeds()
        init_security_headers(app)
    
    #if os.getenv("RAILWAY_ENVIRONMENT_NAME"):
    #    init_migrations(app, db)
    init_company(app)
    init_modules(app)
    if app.debug or app.config.get("DEBUG_MAIL", False):
        import logging
        import smtplib
        smtplib_logger = logging.getLogger("smtplib")
        smtplib_logger.setLevel(logging.DEBUG)
        smtplib_logger.addHandler(logging.StreamHandler())    
    init_mail(app)
    init_admin(app)
    init_assets(app)

    # ✅ Inyectar `current_user` y roles en TODOS los templates
    @app.context_processor
    def inject_globals():
        empresa_id = session.get("company_id")
        empresa_owner = session.get("company_owner_id")
        empresa_nombre = session.get("empresa_nombre")

        empresa_activa = (
            current_user.is_authenticated
            and empresa_id is not None
            and empresa_owner == str(getattr(current_user, "id", None))
        )

        # Si está activa pero no tenemos nombre cacheado, lo resolvemos 1 sola vez
        if empresa_activa and not empresa_nombre:
            empresa_nombre = get_empresa_nombre(empresa_id)  # DB lookup pequeño
        
        return {
            "current_user": current_user,
            "current_year": datetime.now().year,
            "ASSET_VERSION": app.config.get("ASSET_VERSION", "1.0.0"),
            "has_role": has_role,  # ✅ esto ya lo tenías planeado
            "empresa_id": empresa_id if empresa_activa else None,
            "empresa_nombre": empresa_nombre if empresa_activa else None,
            "empresa_activa": empresa_activa,
            "SITE_NAME": app.config.get("SITE_NAME", "Nombre sitio Web"),
            "APP_NAME": app.config.get("APP_NAME", "Aplicación base")
        }

    # ✅ Servir archivos estáticos con Cache-Control prolongado
    @app.route('/static/<path:filename>', endpoint='static')
    def custom_static(filename):
        response = send_from_directory('static', filename)
        if app.debug:
            response.headers["Cache-Control"] = "no-store"
        else:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response

    # ✅ Servir robots.txt manualmente
    @app.route('/robots.txt')
    def robots_txt():
        return send_from_directory('static', 'robots.txt', mimetype='text/plain')

    # ✅ Servir sitemap.xml manualmente
    @app.route('/sitemap.xml')
    def sitemap_xml():
        return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')

    return app
