import os
from .base import BaseConfig

class DatabaseConfig(BaseConfig):
    """Configuración de la Base de Datos."""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DB_TYPE = os.getenv("DB_TYPE", "sqlite").lower()
    INSTANCE_DIR = BaseConfig.INSTANCE_DIR

    DB_URIS = {
        "sqlite": f"sqlite:///{os.path.join(INSTANCE_DIR, 'database.db')}?check_same_thread=False&foreign_keys=on",
        "mysql": os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost/dbname"),
        "postgres": os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")
    }

    SQLALCHEMY_DATABASE_URI = DB_URIS.get(DB_TYPE)

    if SQLALCHEMY_DATABASE_URI is None:
        raise ValueError(f"Unsupported DB_TYPE: {DB_TYPE}. Supported types are: {', '.join(DB_URIS.keys())}")

    SQLALCHEMY_BINDS = {
        "logs": os.getenv("LOGS_DATABASE_URL", f"sqlite:///{os.path.join(INSTANCE_DIR, 'logs.db')}?check_same_thread=False&foreign_keys=on")
    }
