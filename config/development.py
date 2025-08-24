from . import BaseConfig

class DevelopmentConfig(BaseConfig):
    """Configuración para desarrollo."""
    DEBUG = True
    DEBUG_LOGGING = True
    
    # 📌 Cookies 
    SESSION_COOKIE_NAME = "compumas_session_dev"
    SESSION_COOKIE_SECURE = False   #⚠️ Cambiar a True en producción
    SESSION_COOKIE_SAMESITE = "Lax"
    REMEMBER_COOKIE_SECURE   = False   # en dev; en prod → True
    
    # 📌 Configuración de la cookie CSRF
    CSRF_COOKIE_SECURE = False  # ⚠️ Cambiar a True en producción
    
    # 📌 Flask CSRFProtect 
    WTF_CSRF_SSL_STRICT = False # True en prod si se usa Flask CSRFProtect
    
    # 📌 JWT
    ENABLE_JWT = True
    
    # 📌 Dominios y host permitidos
    ALLOWED_ORIGIN_DOMAIN = "127.0.0.1" # O PUEDE SER "localhost" Definir dominio en .env Ej. ALLOWED_ORIGIN_DOMAIN = midominio.com
    SEND_FILE_MAX_AGE_DEFAULT = 0
