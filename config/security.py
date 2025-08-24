#import os
#from .base import BaseConfig

#class SecurityConfig(BaseConfig):
#    """Configuración de Seguridad y Sesiones."""

#    # 📌 Manejo de Sesiones
#    SESSION_TYPE = "filesystem"
#    SESSION_FILE_DIR = os.path.join(BaseConfig.INSTANCE_DIR, "sessions")
#    os.makedirs(SESSION_FILE_DIR, exist_ok=True)
#    SESSION_PERMANENT = True
#    SESSION_USE_SIGNER = True
#    SESSION_COOKIE_NAME = "compumas_session"
#    SESSION_COOKIE_HTTPONLY = True
#    SESSION_COOKIE_SAMESITE = "Lax"
#    SESSION_COOKIE_SECURE = False
#   SESSION_REFRESH_EACH_REQUEST = False
    
