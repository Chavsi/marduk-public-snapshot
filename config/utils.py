# C:\web_project2\config\utils.py
from flask import current_app

#def get_config_DEPREC(key, default=None):
#    try:
#        return current_app.config.get(key, default)
#    except RuntimeError:
#        # Fallback: intenta AppConfig directamente si aún no hay app
#        try:
#            from config import AppConfig
#            return getattr(AppConfig, key, default)
#        except Exception:
#            print(f"⚠ No se pudo acceder a config[{key}].")
#            return default

class ConfigError(KeyError): pass
_SENTINEL = object()

def get_config(key, default=_SENTINEL, cast=None):
    try:
        value = current_app.config.get(key, _SENTINEL)
    except Exception:
        value = _SENTINEL

    if value is _SENTINEL:
        try:
            from config import AppConfig
            value = getattr(AppConfig, key, _SENTINEL)
        except Exception:
            value = _SENTINEL

    if value is _SENTINEL:
        if default is _SENTINEL:
            raise ConfigError(f"Falta config requerida: '{key}'")
        value = default

    return cast(value) if cast else value
