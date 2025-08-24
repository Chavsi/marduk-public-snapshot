// static/js/admin/maintenance/debug_status.js
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("debug-status");
  if (!el) return;

  const url = el.dataset.debugUrl || "/admin/diagnostics/debug_status";
  const REFRESH_MS = 30000;
  const WARN_MS = 250;   // >250ms = warn
  const ERR_MS  = 1000;  // >1000ms = err

  let timer = null;
  let controller = null; // AbortController actual

  const setState = (status, latencyMs, tableName, tableExists, utcIso) => {
    const ok = status === "OK";
    const parts = [
      `${ok ? "🟢" : "🔴"} DB: <strong>${status}</strong>`,
      `${latencyMs}ms`,
    ];
    if (tableName && tableName !== "-") {
      const existsNote = (tableExists === false) ? " (no existe)" : "";
      parts.push(`Tabla: <strong>${tableName}</strong>${existsNote}`);
    }

    // Quita todas y aplica según umbrales
    el.classList.remove("ok", "warn", "err");
    if (!ok || latencyMs > ERR_MS || tableExists === false) {
      el.classList.add("err");
    } else if (latencyMs > WARN_MS) {
      el.classList.add("warn");
    } else {
      el.classList.add("ok");
    }

    el.innerHTML = parts.join(" · ");
    el.title = `Última actualización: ${new Date(utcIso).toLocaleString()}`;
  };

  const setError = () => {
    el.classList.remove("ok", "warn");
    el.classList.add("err");
    el.textContent = "🔴 Error fetching debug info";
  };

  const update = () => {
    // Aborta cualquier fetch anterior en vuelo
    if (controller) controller.abort();
    controller = new AbortController();

    const bust = (url.includes("?") ? "&" : "?") + `_=${Date.now()}`;
    fetch(url + bust, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setState(d.db_status, d.latency_ms, d.table_name, d.table_exists, d.utc))
      .catch(err => {
        // Ignora aborts intencionales
        if (err?.name === "AbortError") return;
        setError();
      });
  };

  function start(){ if (!timer) timer = setInterval(update, REFRESH_MS); }
  function stop(){
    if (timer) { clearInterval(timer); timer = null; }
    if (controller) { controller.abort(); controller = null; }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stop(); } else { update(); start(); }
  });

  window.addEventListener("beforeunload", stop);

  // Inicial
  update();
  start();
});



