# ⚠️ Este archivo es solo para desarrollo local.
# No se usa en producción ni en entornos WSGI.
from app import create_app
from config import AppConfig
import logging


app = create_app()

if __name__ == "__main__":
    host = AppConfig.FLASK_HOST
    port = AppConfig.FLASK_PORT
    debug = AppConfig.DEBUG
    protocol = "HTTPS" if AppConfig.USE_SSL else "HTTP"
    url = f"https://{host}:{port}" if AppConfig.USE_SSL else f"http://{host}:{port}"

    # 📝 Todos los prints aquí son locales y no deben migrarse a logger.
    print("\n" + "=" * 60)
    print(f"🚀 Servidor {AppConfig.APP_NAME} iniciando...")
    print(f"🔧 Modo Debug: {'✅ ON' if debug else '❌ OFF'}")
    print(f"🔐 Protocolo: {protocol}")
    print(f"📡 Dirección de acceso URL: {url}")
    print("=" * 60 + "\n")

    if AppConfig.USE_SSL and "localhost" in url:
        print("⚠️ Usando SSL local (¿certificado autofirmado?)")
        context = (AppConfig.SSL_CERT_FILE, AppConfig.SSL_KEY_FILE)
        app.run(host=host, port=port, debug=debug, ssl_context=context)
    else:
        logging.getLogger("werkzeug").setLevel(logging.ERROR)
        app.run(host=host, port=port, debug=debug)
