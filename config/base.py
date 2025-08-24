import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  # 📌 Cargar variables de entorno si existen

class BaseConfig:
    """Configuración base para todos los entornos."""
    # 📌 DEBUG MODE
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    DEBUG_LOGGING = True # ⚠️ Cambiar a False en producción

    # 📌 Nombre de App y del Site
    APP_NAME = "Marduk"
    SITE_NAME = "CompuMás"

    # 📌 HOSTS: Definir claramente Flask y el servidor externo
    FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
    HOST = os.getenv("HOST", "192.168.0.107")
    PORT = int(os.getenv("PORT", 8080))

    # 📌 Directorios base
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    INSTANCE_DIR = os.path.join(BASE_DIR, "instance")

    # 📌 Configuración de logs
    LOG_DIR = os.path.join(INSTANCE_DIR, "logs")
    LOG_FILE = os.path.join(LOG_DIR, "app.log")

    UPLOAD_FOLDER = os.path.join(INSTANCE_DIR, "uploads")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf", "docx"}

    # 📌 Asegurar que los directorios existan
    for directory in [LOG_DIR, UPLOAD_FOLDER]:
        os.makedirs(directory, exist_ok=True)

    # 📌 EXCEL y CSV IMPORTS
    MAX_CONTENT_LENGTH = 1024 * 1024 * 10
    IMPORT_COMMIT_CHUNK = 500

    # 📌 Seguridad global
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
    PASSWORD_HASH_METHOD = "pbkdf2:sha256"
    
    # 📌 Manejo de Sesiones
    SESSION_FILE_DIR = os.path.join(INSTANCE_DIR, "sessions")
    os.makedirs(SESSION_FILE_DIR, exist_ok=True)
    SESSION_TYPE = "filesystem"
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_REFRESH_EACH_REQUEST = False
    SESSION_PROTECTION = "strong"
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # 📌 Cookies  
    SESSION_COOKIE_HTTPONLY = True #La cookie de sesión nunca debería ser accesible desde JS.
    SESSION_COOKIE_PATH = "/" 
    
    # 📌 Remember Cookies 
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    REMEMBER_COOKIE_HTTPONLY = True # JS nunca toca la sesión (Dev/Prod no lo pisan).
    REMEMBER_COOKIE_SAMESITE = "Lax"   # buena UX en navegaciones top-level
    # opcional: refrescar vencimiento con cada request
    REMEMBER_COOKIE_REFRESH_EACH_REQUEST = True
    REMEMBER_COOKIE_NAME = "remember_token"

    # 📌 Configuración de la cookie CSRF
    CSRF_COOKIE_NAME = "csrf_token"
    CSRF_COOKIE_HTTPONLY = False # ⚠️ Si es True JS no puede leerlo
    CSRF_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_MAX_AGE = 3600

    # 📌 CSRF Token
    CSRF_TOKEN_TTL = 3600 # Tiempo de vida del token CSRF en segundos (por ejemplo: 1 hora = 3600s)
    
    # 📌 Flask CSRFProtect 
    WTF_CSRF_ENABLED = False
    #WTF_CSRF_TIME_LIMIT = 86400 # solo se se usa Flask_csrf, y CSRFProtect
    #WTF_CSRF_HEADERS = ["X-CSRFToken"] # solo se se usa Flask_csrf, y CSRFProtect

    # 📌 JWT
    ENABLE_JWT = False  # ✅ Puedes desactivarlo en producción si no usas APIs
    JWT_EXPIRATION_HOURS = 1
    JWT_ALGORITHM = "HS256"

    # 📌 SSL Opcional
    USE_SSL = os.getenv("USE_SSL", "false").lower() == "true" # en railway true, en .env false
    SSL_CERT_FILE = os.path.join(BASE_DIR, "instance", "localhost.pem")
    SSL_KEY_FILE  = os.path.join(BASE_DIR, "instance", "localhost-key.pem")
