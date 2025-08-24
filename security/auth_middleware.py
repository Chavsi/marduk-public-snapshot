# C:\web_project2\security\auth_middleware.py
from flask import Flask, session, request, has_request_context, redirect, url_for
from flask_session import Session
from flask.sessions import SecureCookieSessionInterface
from config.utils import get_config, ConfigError
from .auth_validators import check_authentication
from .csrf.services import check_csrf_token
from flask_wtf.csrf import generate_csrf
from core.logging.logger import get_logger, log_to_db
from flask_login import current_user
from security.middleware_exempt import EXEMPT_ASSETS_PATHS
from core.utils import utc_now
from company.services import restore_empresa_a_sesion

SESSION_COOKIE_NAME = get_config("SESSION_COOKIE_NAME", cast=str)
REMEMBER_COOKIE_NAME  = get_config("REMEMBER_COOKIE_NAME", cast=str)
SUSPICIOUS_HEADERS = [
    "X-User", "X-Username", "X-Admin", "X-Auth", "X-Role",
    "X-Forwarded-User", "X-Remote-User", "X-TrustMe",
]
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
ALWAYS_CSRF_EXEMPT_PATHS = {"/auth/login", "/csrf/get"}

#CSRF TOKENS MASK

def _mask(v): 
    return (v[:4] + "…") if isinstance(v, str) and len(v) > 4 else v

def is_loggable_request():
    """Retorna True si la ruta actual merece log detallado."""
    static_paths = ["/static/", "/favicon.ico"]
    ignore_paths = ["/csrf/get", "/session/ping", "/auth/status"]

    return (
        not any(request.path.startswith(p) for p in static_paths)
        and request.path not in ignore_paths
    )

def init_session(app: Flask):
    """Inicializa correctamente la sesión y asegura la seguridad."""
    logger = get_logger()
    
    logger.info("🔄 Configurando sistema de sesión...")
    logger.debug("⚙️  Parámetros de sesión cargados:")
    session_keys = [
        "SESSION_TYPE", "SESSION_FILE_DIR", "SESSION_PERMANENT", "SESSION_USE_SIGNER",
        "SESSION_REFRESH_EACH_REQUEST", "SESSION_PROTECTION", "SESSION_COOKIE_NAME",
        "SESSION_COOKIE_HTTPONLY", "SESSION_COOKIE_SAMESITE", "SESSION_COOKIE_SECURE",
        "PERMANENT_SESSION_LIFETIME", "CSRF_COOKIE_NAME", "CSRF_COOKIE_HTTPONLY",
        "CSRF_COOKIE_SAMESITE", "CSRF_COOKIE_SECURE"
    ]
    for key in session_keys:
        try:
            logger.debug(f"   {key}: {get_config(key)}")
        except ConfigError:
            logger.debug(f"   {key}: <MISSING>")

    logger.info("✅ Inicializando Flask-Session...\n")
    
    class CustomSessionInterface(SecureCookieSessionInterface):
        def should_set_cookie(self, app, session):
            # 🔒 Establecer cookie solo si hay una sesión válida
            return has_request_context() and super().should_set_cookie(app, session)

        def open_session(self, app, request):
            session = super().open_session(app, request)
            if session is not None:
                session.permanent = True
            return session

    # 🔧 Sobrescribir la interfaz si sigues usando filesystem
    if app.config["SESSION_TYPE"] == "filesystem":
        app.session_interface = CustomSessionInterface()

    Session(app)  # 🔥 Esto ya maneja la sesión automáticamente

    @app.before_request
    def middleware():
        """Middleware global: maneja sesión, CORS, CSRF y autenticación en un solo lugar."""

        #if is_loggable_request():
        #    logger.debug(f"🎯 endpoint detectado: {request.endpoint}")
        # ✅ 0. Excepción explícita para permitir que /csrf/get funcione sin login
        if request.path == "/csrf/get":
            logger.debug("🧪 Excepción: permitiendo acceso directo a /csrf/get sin autenticación.")
            if "_csrf_token" not in session:
                session["_csrf_token"] = generate_csrf()
                session["_csrf_issued_at"] = utc_now().timestamp()
                logger.debug(f"🧪 Token CSRF generado explícitamente: {_mask(session.get('_csrf_token'))}")
            return  # ⬅ Esto hace que la vista /csrf/get se ejecute normalmente

        if is_loggable_request():
            logger.debug(f"🧠 Request path: {request.path}")  #MEGA IMPORTANTE STE DEBUG
            logger.debug(f"🔐 Session cookie recibida: {request.cookies.get(SESSION_COOKIE_NAME)}")
            logger.debug(f"📦 _csrf_token en sesión: {_mask(session.get('_csrf_token'))}")
        
        suspicious_headers = []
        for header in SUSPICIOUS_HEADERS:
            if header in request.headers:
                suspicious_headers.append(f"{header}: {request.headers.get(header)}")

        if suspicious_headers:
            logger.warning(f"🧨 Headers sospechosos detectados: {suspicious_headers}")
            log_to_db(
                "WARNING",
                f"🧨 Headers sospechosos: {suspicious_headers} | IP={request.remote_addr}",
                module="security.header_check",
                user=getattr(current_user, "username", None)
            )
        
        # ⚠️⚠️⚠️ Diagnóstico: detectar token CSRF crudo ⚠️⚠️⚠️
        if "csrf_token" in session:
            logger.warning("🧨 [Middleware] csrf_token crudo detectado en sesión.")
            logger.debug(f"Valor no firmado (masked): {_mask(session.get('csrf_token'))}")
            log_to_db(
                "WARNING",
                f"🧨 csrf_token crudo detectado en sesión | IP={request.remote_addr}",
                module="security.middleware"
            )
            # ⚠️ Opcional: eliminarlo temporalmente para evitar que ensucie vistas
            session.pop("csrf_token", None)

        # ⚠️⚠️⚠️ SOLO crear CSRF si la sesión ya está activa y aún no tiene token ⚠️⚠️⚠️
        if "_csrf_token" not in session:
            # Solo generar si hay cookie de sesión válida
            incoming_cookie = request.cookies.get(SESSION_COOKIE_NAME)
            remember_cookie  = request.cookies.get(REMEMBER_COOKIE_NAME)
            logger.debug(f"🔐 Remember cookie recibida: {bool(remember_cookie)}")

            if current_user.is_authenticated and (incoming_cookie or remember_cookie):
                session.permanent = True 
                session["_csrf_token"] = generate_csrf()
                session["_csrf_issued_at"] = utc_now().timestamp()  # Guardar tiempo de emisión
                session.modified = True
                logger.debug(f"🛡️ CSRF generado (usuario autenticado): {_mask(session.get('_csrf_token'))}")
                log_to_db(
                    "INFO",
                    f"🛡️ CSRF generado para usuario autenticado | IP={request.remote_addr}",
                    module="security.middleware",
                    user=getattr(current_user, "username", None)
                )
            else:
                logger.debug("🕳️ Saltando generación de CSRF: sesión no válida o usuario no autenticado")
    
        # ✅ 0. Ignorar rutas públicas sin validación
        if request.path in ("/robots.txt", "/sitemap.xml"):
            return

        # ✅ 1. Ignorar pre-flight requests de CORS (usadas por fetch con headers personalizados)
        if request.method == "OPTIONS":
            return
        
        if request.endpoint is None:
            return 
        # 👀 Diagnóstico: método/endpoint actual
        if is_loggable_request():
            logger.debug(f"🧭 method={request.method} endpoint={request.endpoint} path={request.path}")

        # ✅ 2. Revisar CSRF solo en métodos que lo requieren
        #if request.method in ["POST", "PUT", "DELETE"]:
        #    if request.path not in ["/auth/login", "/csrf/get"]:

        if request.method in UNSAFE_METHODS:
            # ⛳ exento por endpoint, o rutas especiales
            csrf_exempt_endpoints = set(get_config("CSRF_EXEMPT_ENDPOINTS", cast=list))
            is_exempt = (request.endpoint in csrf_exempt_endpoints) or (request.path in ALWAYS_CSRF_EXEMPT_PATHS)

            if not is_exempt:
                logger.debug(f"🛡️ Validando CSRF para: {request.path}")
                logger.debug(f"🔍 Token en sesión: {_mask(session.get('_csrf_token'))}")
                logger.debug(f"🔍 Token enviado: {_mask(request.headers.get('X-CSRFToken'))}")
                if is_loggable_request():
                    masked = dict(session)  # copia superficial
                    if "_csrf_token" in masked:
                        masked["_csrf_token"] = _mask(masked["_csrf_token"])
                    logger.debug(f"💣 DEBUG antes del check CSRF — claves sesión: {list(session.keys())} | csrf={masked.get('_csrf_token')}")
                
                # ⚠️ Validar expiración del token
                issued_at = session.get("_csrf_issued_at")
                ttl = get_config("CSRF_TOKEN_TTL", cast=int)
                
                if issued_at:
                    now = utc_now().timestamp()
                    if now - issued_at > ttl:
                        logger.warning("⏰ Token CSRF expirado.")
                        log_to_db(
                            "WARNING",
                            f"⏰ Token CSRF expirado en ruta {request.path} | IP={request.remote_addr}",
                            module="security.middleware",
                            user=getattr(current_user, "username", None)
                        )
                        session.pop("_csrf_token", None)
                        session.pop("_csrf_issued_at", None)
                        return {"error": "Token CSRF expirado"}, 403
                else:
                    logger.debug("🕳️ No se encontró '_csrf_issued_at' en la sesión — omitiendo expiración.")

                csrf_error = check_csrf_token() # Importa desde auth_validators.py
                if csrf_error:
                    logger.warning("❌ CSRF inválido.")
                    log_to_db(
                        "WARNING",
                        f"❌ Falla en validación CSRF en ruta {request.path} | IP={request.remote_addr}",
                        module="security.middleware",
                        user=getattr(current_user, "username", None)
                    )
                    return csrf_error

        # ✅ 3. Revisar autenticación
        auth_error = check_authentication() # Importa desde auth_validators.py
        if auth_error:
            if get_config("DEBUG_LOGGING", cast=bool):
                logger.warning("⚠️ Falla en Auth Middleware")
            return auth_error

        # ✅ 4. Mantener sesión activa
        session.permanent = True

        if current_user.is_authenticated:
            # 🔁 Restaurar empresa si no está en sesión
            owner = session.get("company_owner_id")
            comp_id = session.get("company_id")
            
            # 🧽 Si hay company_id pero pertenece a otro usuario → purgar
            if comp_id and (owner is None or owner != str(current_user.id)):
                for k in ("company_id", "empresa_nombre", "company_owner_id"):
                    session.pop(k, None)
                session.modified = True

            if (session.get("company_id") is None) or (session.get("company_owner_id") != str(current_user.id)):
                empresa = restore_empresa_a_sesion(current_user.id)
                if empresa:
                    session["company_id"] = empresa.id
                    session["empresa_nombre"] = getattr(empresa, "name", None)
                    session["company_owner_id"] = str(current_user.id)
                    session.modified = True
                    logger.debug(f"🏢 Empresa restaurada: {empresa.name} (ID: {empresa.id}) para user={current_user.id}")
                else:
                    logger.debug("🕳️ Usuario autenticado sin empresa asociada")
                    pass

            # 🔥 Control de acceso por assets
            is_assets_route = request.path.startswith("/assets/")
            
            if is_assets_route and request.path not in EXEMPT_ASSETS_PATHS:
                if "company_id" not in session:
                    logger.debug(f"🔁 Ruta bloqueada por falta de empresa: {request.path}")
                    log_to_db(
                        "WARNING",
                        f"🔁 Acceso bloqueado a ruta '{request.path}' sin empresa en sesión | IP={request.remote_addr}",
                        module="security.assets_access",
                        user=getattr(current_user, "username", None)
                    )
                    return redirect(url_for("company.setup.views.show_empresa_setup"))
        else:
            # ⬅️ AQUÍ va tu bloque de limpieza cuando NO hay usuario auth
            for k in ("company_id", "empresa_nombre", "company_owner_id"):
                session.pop(k, None)

    @app.after_request
    def set_cookies(response):
        """
        Inyecta cookies de sesión y CSRF de forma segura,
        con logging limpio y conteo para evitar spam visual.
        """

        debug = get_config("DEBUG_LOGGING", cast=bool)
        show_log = False
        path = request.path

        # Evita spamear en APIs, ping, static, auth
        if (
            not path.startswith("/static") and
            not path.startswith("/session") and
            not path.startswith("/auth") and
            not path.startswith("/admin/assets/api") and
            not path.startswith("/use/api") and
            not path.startswith("/favicon")
        ):
            show_log = True

        events = []
        
        # Guardar cambios en sesión si ha sido modificada
        if session.modified:
            session.permanent = True
            if debug:
                events.append("🧠 Session modificada → marcada como permanente.")

        # Inyectar token CSRF si está presente en sesión
        if session.pop("_csrf_cookie_dirty", False):
            response.set_cookie(
                get_config("CSRF_COOKIE_NAME", cast=str),
                session["_csrf_token"],
                httponly=get_config("CSRF_COOKIE_HTTPONLY", cast=bool),
                samesite=get_config("CSRF_COOKIE_SAMESITE", cast=str),
                secure=get_config("CSRF_COOKIE_SECURE", cast=bool),
                max_age=get_config("CSRF_COOKIE_MAX_AGE", cast=int),
                path=get_config("SESSION_COOKIE_PATH", cast=str),
            )
            if debug and show_log:
                events.append("🔐 CSRF inyectado")

        if debug and show_log:
            if events:
                logger.debug(f"🍪 Cookies: {' + '.join(events)}")
            else:
                logger.debug("🫥 No hubo cambios en sesión ni CSRF.")

        if request.path == "/auth/logout":
            logger.debug(f"↩️ Set-Cookie en logout: {response.headers.getlist('Set-Cookie')}")

        return response
