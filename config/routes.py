class RoutesConfig:
    """Configuración de las rutas."""

    # 🔹 Rutas públicas permitidas sin autenticación
    PUBLIC_ROUTES = [
        "",
        "errors.manual_400",
        "errors.manual_401",
        "errors.manual_403",
        "errors.manual_404",
        "errors.manual_500",
        "devtools.show_devtools_svg",
        "devtools.serve_svg", 
        "home.index",
        "landing.index",
        "marduk.index",
        "marduk.md_view",
        "info.index",
        "nosotros.index",
        "mdviewer.md_index",
        "mdviewer.md_view",
        "csrf.get_csrf",
        "jwt.generate",
        "jwt.verify", 
        "auth.status.auth_status",
        "auth.login.login",
        "auth.register.register",
        "auth.logout.logout",
        "botfriendly.bots_landing",
        "auth.change_password.report_unauthorized_change",
        "session_ping.ping_session",
        "auth.forgot_password.forgot_password",
        "auth.reset_password.reset_password",
        "test.hello",
        "test.echo"
    ]

    JWT_PROTECTED_ROUTES = [
    "jwt_example.protected_example"
    ]

    DEBUG_ROUTES = ["session_debug.session_debug"]

    CSRF_EXEMPT_ENDPOINTS = [
    "test.echo",        # tu POST de pruebas
    # "test.secure_echo",  # si luego lo usas
    ]