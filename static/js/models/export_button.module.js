// Minimalista: abre el endpoint XLSX en otra pestaña.
// Respeta filtros si existen (arma querystring desde #filters-form).
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-export");
  if (!btn) return;

  const container = document.getElementById("model-table");
  if (!container) return;

  const { model, exportXlsxUrl, exportCsvUrl } = container.dataset;
  if (!model || (!exportXlsxUrl && !exportCsvUrl)) return;

  const form = document.getElementById("filters-form");
  const modal = document.getElementById("export-modal");
  const btnXlsx = document.getElementById("export-confirm-xlsx");
  const btnCsv  = document.getElementById("export-confirm-csv");
  const btnClose = modal?.querySelector("[data-close]");
  const exportTotalEl = document.getElementById("export-total");
  const fmt = (n) => Number.isFinite(n) ? n.toLocaleString("es-EC") : "0";
  const busyMsgFor = (kind) => `Exportando ${fmt(getCurrentTotal())} registros a ${kind}…`;

  const getCurrentTotal = () => {
    // lee del dataset que seteaste al cargar la tabla
    const n = Number(container?.dataset.totalItems || 0);
    return Number.isFinite(n) ? n : 0;
  };

  const showModal = () => {
    if (exportTotalEl) exportTotalEl.textContent = fmt(getCurrentTotal());
    modal.classList.remove("hidden");
    // opcional: foco al primer botón
    btnXlsx?.focus();
    // cerrar con ESC
    const onEsc = (e) => { if (e.key === "Escape") hideModal(); };
    modal.dataset._esc = "1";
    document.addEventListener("keydown", onEsc, { once: true });
  };
  const hideModal = () => modal.classList.add("hidden");

  const buildQueryFromForm = (f) => {
    if (!f) return "";
    const params = new URLSearchParams();
    f.querySelectorAll("input, select").forEach((el) => {
      if (el.name && el.value) params.append(el.name, el.value);
    });
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const parseFilename = (disposition, fallback) => {
    if (!disposition) return fallback;
    const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(disposition);
    const raw = decodeURIComponent(m?.[1] || "") || m?.[2];
    return raw || fallback;
  };

  function showBusy(message = "Procesando…") {
    const overlay = document.getElementById("busy-overlay");
    const text = document.getElementById("busy-text");
    if (!overlay || !text) return;
    text.textContent = message;
    overlay.classList.remove("hidden");
  }

  function hideBusy() {
    const overlay = document.getElementById("busy-overlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
  }

  const doExport = async (url, fallbackName, busyMsg = "Exportando…") => {
    showBusy(busyMsg);
    try {
      const res = await fetch(url, { method: "GET", credentials: "same-origin" });
      if (!res.ok) { alert(`No se pudo exportar (${res.status}).`); return; }

      const disp = res.headers.get("Content-Disposition");
      const filename = parseFilename(disp, fallbackName);

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch (err) {
      console.error("❌ Error al exportar:", err);
      alert("Error de red al exportar.");
    } finally {
      hideBusy();
    }
  };

  // Abrir modal
  btn.addEventListener("click", () => {
    // si solo hay uno disponible, exporta directo sin modal
    const qs = buildQueryFromForm(form);
    if (exportXlsxUrl && exportCsvUrl) {
      showModal();
    } else if (exportXlsxUrl) {
      doExport(exportXlsxUrl + qs, `${model}-export.xlsx`, busyMsgFor("Excel"));
    } else if (exportCsvUrl) {
      doExport(exportCsvUrl + qs, `${model}-export.csv`, busyMsgFor("CSV"));
    }
  });

  // Confirmar XLSX
  btnXlsx?.addEventListener("click", () => {
    const qs = buildQueryFromForm(form);
    hideModal();
    doExport(exportXlsxUrl + qs, `${model}-export.xlsx`, busyMsgFor("Excel"));
  });

  // Confirmar CSV
  btnCsv?.addEventListener("click", () => {
    const qs = buildQueryFromForm(form);
    hideModal();
    doExport(exportCsvUrl + qs, `${model}-export.csv`, busyMsgFor("CSV"));
  });

  // Cancelar
  btnClose?.addEventListener("click", hideModal);

  // Cerrar si clickean fuera del contenido
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
});
