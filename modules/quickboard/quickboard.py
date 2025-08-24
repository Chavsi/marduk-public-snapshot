from flask import Blueprint, render_template
from flask_login import login_required, current_user
from core.logging.logger import get_logger
from company.services import get_company_id_or_error
from core.roles.services import get_role_dashboard_config
from core.roles.roles_decorators import role_required
from assets.models import PC, Celular, Periferico, AssetUser
from core.database.constants import DASHBOARD_PERCENT_DECIMALS

quickboard_bp = Blueprint("quickboard", __name__)

@quickboard_bp.route("/quickboard", methods=["GET"])
@login_required
@role_required("admin", "premium", "pro", "plus", "user")
def index():
    logger = get_logger()
    user_role = getattr(getattr(current_user, "role", None), "value", None)
    logger.info(f"🔐 Acceso al quickboard por: {current_user.username} (rol: {user_role})")

    cfg = get_role_dashboard_config(user_role)
    if not cfg:
        logger.warning(f"🔐 Rol inválido o sin configuración de dashboard: '{user_role}'. Redirigiendo.")
        return render_template("pages/landing.html")

    company_id, error_response, _ = get_company_id_or_error()
    if error_response:
        # Sin empresa activa: no reventar, mostrar CTA en el template
        cfg["total_dispositivos"] = None
        cfg["total_usuarios"] = None
        return render_template("dashboard/quickboard.html", **cfg)

    # Con empresa activa: intentar cargar totales de forma segura
    try:
        total_usuarios = AssetUser.query.filter_by(company_id=company_id).count()
        total_pcs = PC.query.filter_by(company_id=company_id).count()
        total_celulares = Celular.query.filter_by(company_id=company_id).count()
        total_perifericos = Periferico.query.filter_by(company_id=company_id).count()

        total_dispositivos = total_pcs + total_celulares + total_perifericos

        DECIMALES = DASHBOARD_PERCENT_DECIMALS
        def pct(part, total, decimals=0):
            if not total:
                return 0 if decimals == 0 else round(0.0, decimals)
            val = (part * 100.0) / total
            return int(val) if decimals == 0 else round(val, decimals)

        pcs_pct = pct(total_pcs, total_dispositivos, DECIMALES)
        celulares_pct = pct(total_celulares, total_dispositivos, DECIMALES)
        perifericos_pct = pct(total_perifericos, total_dispositivos, DECIMALES)

    except Exception:
        logger.exception("❌ Fallo leyendo totales del quickboard")
        total_usuarios = None
        total_pcs = None
        total_celulares = None
        total_perifericos = None
        total_dispositivos = None
        pcs_pct = None
        celulares_pct = None
        perifericos_pct = None

    cfg.update({
        "total_usuarios": total_usuarios,
        "total_pcs": total_pcs,
        "total_celulares": total_celulares,
        "total_perifericos": total_perifericos,
        "total_dispositivos": total_dispositivos,
        "pcs_pct": pcs_pct,
        "celulares_pct": celulares_pct,
        "perifericos_pct": perifericos_pct,
    })

    return render_template("dashboard/quickboard.html", **cfg)
