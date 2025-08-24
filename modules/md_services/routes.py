import os, json, re
from flask import Blueprint, render_template, abort, current_app
from markdown import markdown
from werkzeug.utils import secure_filename


mdviewer_bp = Blueprint("mdviewer", __name__, template_folder="templates", url_prefix="/md")


@mdviewer_bp.route("/index")
def md_index():
    json_path = os.path.join(current_app.root_path, "static", "md_files", "servicios", "md_index.json")
    with open(json_path, "r", encoding="utf-8") as f:
        files = json.load(f)
    return render_template("md_servicios/md_index.html", files=files)

@mdviewer_bp.route("/<filename>")
def md_view(filename):
    try:
        filename = secure_filename(filename)
        md_dir = os.path.join(current_app.root_path, "static", "md_files", "servicios")
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
        return render_template("md_servicios/md_view.html", content=html_content, filename=filename)

    except Exception as e:
        return f"Error: {e}", 500

