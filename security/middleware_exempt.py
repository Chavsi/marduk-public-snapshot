# C:\web_project2\assets\constants\middleware_exempt.py

"""
❗ Esta lista define los *blueprints* de /assets/ que deben estar exentos del check de `company_id`.

✅ Se evalúa *solo si el usuario ya está autenticado* y accede a una ruta bajo `/assets/`.

NO incluir rutas públicas como info, landing, etc. que ya están controladas por check_authentication().
"""

EXEMPT_ASSETS_PATHS = [
    # Agrega todas las rutas necesarias que NO requieren company_id
]