import os, re
from flask import Blueprint, render_template, abort, current_app
from core.logging.logger import get_logger
from markdown import markdown
from werkzeug.utils import secure_filename


appfeatures_bp = Blueprint("marduk", __name__, template_folder="templates", url_prefix="/marduk")


@appfeatures_bp.route("/index")
def index():
    """Display the Info page."""
    logger = get_logger()
    logger.info("📌 Página de Marduk Features solicitada.")

    try:
        return render_template("md_appfeatures/marduk.html")  # ✅ Ajusta la ruta del template
    except Exception as e:
        logger.error(f"❌ ERROR en Info: {str(e)}")
        return "<h2>500 - Error interno en Info</h2>", 500

@appfeatures_bp.route("/<filename>")
def md_view(filename):
    try:
        filename = secure_filename(filename)
        md_dir = os.path.join(current_app.root_path, "static", "md_files", "appfeatures")
        md_path = os.path.join(md_dir, f"{filename}.md")

        if not os.path.exists(md_path):
            abort(404)

        with open(md_path, "r", encoding="utf-8") as f:
            md_content = f.read()

        raw_html = markdown(md_content, extensions=["fenced_code", "tables"])

        html_content = re.sub(
            r'<pre><code class="language-mermaid">(.*?)</code></pre>',
            r'<div class="mermaid">\1</div>',
            raw_html,
            flags=re.DOTALL
        )
        return render_template("md_appfeatures/md_view.html", content=html_content, filename=filename)

    except Exception as e:
        return f"Error: {e}", 500