# C:\web_project2\config\__init__.py
import os
from .base import BaseConfig
from .database import DatabaseConfig 
from .routes import RoutesConfig
from .asset import AssetConfig
from .development import DevelopmentConfig
from .production import ProductionConfig
from .mail import MailConfig
from .users_config import UsersConfig


class CoreConfig(
    DatabaseConfig,
    BaseConfig,
    RoutesConfig,
    AssetConfig,
    MailConfig,
    UsersConfig
):
    """Configuración completa, combinando BaseConfig y DatabaseConfig."""
    pass

env = os.getenv("FLASK_ENV", "production").lower()

Base = ProductionConfig if env == "production" else DevelopmentConfig
ConfigName = "PRODUCCIÓN" if env == "production" else "DESARROLLO"

class AppConfig(Base, CoreConfig):
    """Configuración activa según entorno"""
    pass

# ❗ Usamos print porque el logger aún no está inicializado en esta fase temprana.
print(f"⚙️ [AppConfig] Usando configuración de {ConfigName}")
