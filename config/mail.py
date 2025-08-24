# C:\web_project2\config\mail.py
import os

class MailConfig:
    """Configuración de correo saliente (SMTP) para notificaciones."""

    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT"))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False

    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
    MAIL_ADMIN_ALERT = os.getenv("MAIL_ADMIN_ALERT")
