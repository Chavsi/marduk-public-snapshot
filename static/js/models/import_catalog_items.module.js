document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("import-form");
  if (!form) return;

  const btnUpload = document.getElementById("btn-upload");
  const btncsvTemplate = document.getElementById("btn-csv-template");
  const btnexcelTemplate = document.getElementById("btn-excel-template");
  const resultBox = document.getElementById("import-result");
  const summaryEl = document.getElementById("import-summary");
  const errorsWrap = document.getElementById("import-errors");
  const errorsBody = document.getElementById("import-errors-body");
  const btnDownloadErrors = document.getElementById("btn-download-errors");

  const apiUrl = form.getAttribute("action");
  const expectedFields = (() => {
    try { return JSON.parse(form.dataset.expectedFields || "[]"); }
    catch { return []; }
  })();

  // Descarga plantilla CSV (solo encabezado)
  if (btncsvTemplate) {
    btncsvTemplate.addEventListener("click", () => {
      const header = expectedFields.join(",");
      const blob = new Blob([header + "\n"], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantilla_${(document.title || "import").toLowerCase().replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // Descarga plantilla XLSX (solo encabezado)
  if (btnexcelTemplate) {
    btnexcelTemplate.addEventListener("click", async () => {
      const url = btnexcelTemplate.dataset.templateUrl;
      if (url) {
        // Descarga directa desde el servidor (content-disposition)
        window.location.href = url;
        return;
      }
      // Fallback CSV si no hay endpoint
      const header = expectedFields.join(",");
      const blob = new Blob([header + "\n"], { type: "text/csv;charset=utf-8" });
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "plantilla.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    });
  }

  // Submit AJAX
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!apiUrl || apiUrl === "#") {
      alert("🚧 Endpoint de import aún no configurado.");
      return;
    }

    const fileInput = form.querySelector("#file");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Selecciona un archivo primero.");
      return;
    }

    // UI: bloquea mientras sube
    btnUpload.disabled = true;
    btnUpload.textContent = "Importando…";

    // Limpia resultado previo
    summaryEl.textContent = "";
    errorsBody.innerHTML = "";
    errorsWrap.classList.add("hidden");
    resultBox.classList.add("hidden");

    try {
      const fd = new FormData(form);
      // CSRF (si tienes meta con token)
      const csrf = document.querySelector("meta[name='csrf-token']")?.content;

      const res = await fetch(apiUrl, {
        method: "POST",
        body: fd,
        credentials: "same-origin",
        headers: csrf ? {
          "X-CSRFToken": csrf,
          "X-Requested-With": "XMLHttpRequest"
        } : { "X-Requested-With": "XMLHttpRequest" }
      });

      const json = await res.json().catch(() => ({}));

      resultBox.classList.remove("hidden");

      if (!res.ok || json.success === false) {
        summaryEl.textContent = json.error || "Error en la importación.";
        summaryEl.style.color = "#ffb3b3";
        return;
      }

      // Éxito + Errores
      const ok = Number(json.imported || 0);
      const errs = Array.isArray(json.errors) ? json.errors : [];
      summaryEl.textContent = `✅ Importados: ${ok} ${errs.length ? `| ❗ Con errores: ${errs.length}` : ""}`;
      summaryEl.style.color = "";

      if (errs.length) {
        errorsWrap.classList.remove("hidden");
        // render hasta 200 filas para no explotar la UI
        const MAX = 200;
        errs.slice(0, MAX).forEach(({ row, error }) => {
          const tr = document.createElement("tr");
          const tdRow = document.createElement("td");
          const tdErr = document.createElement("td");
          tdRow.textContent = row;
          tdErr.textContent = error;
          tr.appendChild(tdRow);
          tr.appendChild(tdErr);
          errorsBody.appendChild(tr);
        });

        // descargar errores
        if (btnDownloadErrors) {
          btnDownloadErrors.onclick = () => {
            const header = "row,error\n";
            const lines = errs.map(e => {
              const safeErr = (e.error || "").replace(/"/g, '""');
              return `${e.row},"${safeErr}"`;
            }).join("\n");
            const blob = new Blob([header + lines], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "errores_import.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          };
        }
      }

    } catch (err) {
      resultBox.classList.remove("hidden");
      summaryEl.textContent = `Error de red o procesamiento: ${err}`;
      summaryEl.style.color = "#ffb3b3";
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = "Importar";
    }
  });
});
