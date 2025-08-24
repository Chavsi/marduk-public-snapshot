from . import BaseConfig
import os

class ProductionConfig(BaseConfig):
    """Configuración para producción."""
    DEBUG = False
    DEBUG_LOGGING = False
    
    # 📌 Cookies 
    SESSION_COOKIE_NAME = "__Host-compumas_session"
    SESSION_COOKIE_SECURE = True # ⚠️ True roducción ⚠️
    SESSION_COOKIE_SAMESITE = "Strict"
    REMEMBER_COOKIE_SECURE = True
    
    # 📌 Configuración de la cookie CSRF
    CSRF_COOKIE_SECURE = True  # ⚠️ True Producción ⚠️
    
    # 📌 Flask CSRFProtect 
    WTF_CSRF_SSL_STRICT = False # True si se usa Flask CSRFProtect
    
    # 📌 JWT
    ENABLE_JWT = False #STAND BY
    
    # 📌 Dominios y host permitidos
    ALLOWED_ORIGIN_DOMAIN = os.getenv("ALLOWED_ORIGIN_DOMAIN") # Definir dominio en .env Ej. ALLOWED_ORIGIN_DOMAIN = midominio.com
    SEND_FILE_MAX_AGE_DEFAULT = 31536000
