from .base import BaseConfig

class WindowsConfig(BaseConfig):
    DEBUG = True  # Windows es solo para desarrollo
    WAITRESS_THREADS = 4
    WAITRESS_MAX_REQUEST_BODY_SIZE = 1024 * 1024 * 10  # 10MB
    WAITRESS_ASYNC_USE_POLL = True
