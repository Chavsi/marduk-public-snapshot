from flask import session, current_app

def set_csrf_cookie(response):
    """
    Agrega la cookie CSRF a la respuesta dada.
    """
    token = session.get("_csrf_token", None)
    if token:
        response.set_cookie(
            current_app.config.get("CSRF_COOKIE_NAME", "csrf_token"),
            token,
            httponly=current_app.config.get("CSRF_COOKIE_HTTPONLY", True),
            samesite=current_app.config.get("CSRF_COOKIE_SAMESITE", "Lax"),
            secure=current_app.config.get("CSRF_COOKIE_SECURE", False)
        )
    return response
