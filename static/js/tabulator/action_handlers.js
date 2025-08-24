// ✅ ACCIONES ESPECIALES
const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

function buildActionUrl(action, rowData) {
  const container = getContainer();
  if (!container) return null;
  const tpl = container?.dataset.actionUrlTemplate || "";
  const model = window.catalogTable?.modelName || container?.dataset.model;
  const id = rowData?.id;
  if (!tpl || !model || !id) return null;
  return tpl
    .replace("{model}", encodeURIComponent(model))
    .replace("{id}", encodeURIComponent(id))
    .replace("{action}", encodeURIComponent(action));
}

///ITEM_ID O ID 
function getItemCode(row) {
  return row?.item_id ?? row?.id ?? "";
}
///LABEL
function getItemLabel(row) {
  return row?.label ?? "NO LABEL";
}

function getContainer() {
  return document.querySelector(".tabulator-container");
}

function getAssignConfig() {
  const c = getContainer();
  return {
    endpoint: c?.dataset.assignChoicesEndpoint || "",
    payloadField: c?.dataset.assignPayloadField || "",
    expires: (c?.dataset.assignExpires === "true"),
    expiresLabel: c?.dataset.assignExpiresLabel || "Expira (opcional)",
  };
}

async function loadAssignChoices(endpoint) {
  const r = await fetch(endpoint, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
    credentials: "same-origin",
  });
  const data = await r.json();

  const raw = Array.isArray(data) ? data :
              (Array.isArray(data?.choices) ? data.choices : null);

  if (!raw) throw new Error("Formato de choices inválido.");

  // Normaliza a {id, name}
  return raw.map((x) => ({
    id: (x.id ?? x.value),
    name: (x.name ?? x.label ?? String(x.id ?? x.value)),
  })).filter(x => x.id != null);
}

// 👉 Helper para POST JSON (deja el postAndAlert viejo para otras acciones)
function postAndAlertJson(url, payload) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "same-origin",
    body: JSON.stringify(payload || {})
  })
  .then(async (res) => {
    let data = null; try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    alert(data?.message || "✅ Hecho");
    window.reloadCatalogData?.();
  })
  .catch((err) => alert(`❌ ${err.message || "Error de red"}`));
}

function postAndAlert(url) {
  return fetch(url, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken, "X-Requested-With": "XMLHttpRequest" },
    credentials: "same-origin"
  })
  .then(async (res) => {
    let data = null;
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) {

      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    alert(data?.message || "✅ Hecho");
    window.reloadCatalogData?.();
  })
  .catch((err) => {
    alert(`❌ ${err.message || "Error de red"}`);
  });
}

///EXTRA ACTION
export function handleExtraAction(rowData) {
  const itemId = getItemCode(rowData);
  const label = getItemLabel(rowData);
  const modal = document.getElementById("extra-modal");
  const content = document.getElementById("extra-modal-content");

  if (modal && content) {
    content.innerHTML = `
      <h2>⚡ Acción Especial</h2>
      <p>Este es un canal especial para <strong>Item ID: ${esc(itemId)} - ${esc(label)}</strong></p>
      <div class="modal-buttons">
        <button class="button button-success" id="closeSpecialAction">Cerrar</button>
      </div>
    `;
    modal.classList.remove("hidden");

    const closeBtn = document.getElementById("closeSpecialAction");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }
  }
}

///ACTIVATE
export function handleActivateAction(rowData) {
  const url = buildActionUrl("activate", rowData);
  if (!url) return alert("❌ Error interno al activar.");
  const itemCode = getItemCode(rowData);
  const label = getItemLabel(rowData);
  if (!confirm(`¿✅ Activar el recurso ${itemCode}${label ? " - " + label : ""}?`)) return;

  postAndAlert(url);
}

///DEACTIVATE
export function handleDeactivateAction(rowData) {
  const url = buildActionUrl("deactivate", rowData);
  if (!url) return alert("❌ Error interno al desactivar.");
  const itemCode = getItemCode(rowData);
  const label = getItemLabel(rowData);
  if (!confirm(`¿❌ Desactivar el recurso ${itemCode}${label ? " - " + label : ""}?`)) return;

  postAndAlert(url);
}

/// PRINT
export function handlePrintAction(rowData) {
  const container = getContainer(); 
  const tpl = container?.dataset.printUrlTemplate;  
  const model = window.catalogTable?.modelName || container?.dataset.model; // 👈
  const id = rowData?.id; // print usa ID (admin y multi), no item_id 
  if (!tpl || !model || !id) {
    return alert("❌ No hay template de impresión o faltan datos.");
  }
  const url = tpl
    .replace("{model}", encodeURIComponent(model))
    .replace("{id}", encodeURIComponent(id));
  window.open(url, "_blank", "noopener,noreferrer");
}

/// ASSIGN
// 👉 ASSIGN (modal simple usando el #extra-modal existente)
export async function handleAssignAction(rowData) {
  const url = buildActionUrl("assign", rowData);
  if (!url) return alert("❌ Error interno (URL).");

  // Lee configuración desde metadata
  const { endpoint, payloadField, expires, expiresLabel } = getAssignConfig();
  if (!endpoint || !payloadField) {
    return alert("❌ Falta configuración de assign (endpoint o payloadField).");
  }

  const modal = document.getElementById("extra-modal");
  const content = document.getElementById("extra-modal-content");
  if (!modal || !content) return alert("❌ Falta #extra-modal.");

  content.innerHTML = `<p style="margin:0">⏳ Cargando opciones...</p>`;
  modal.classList.remove("hidden");

  let choices = [];
  try {
    choices = await loadAssignChoices(endpoint);
  } catch {
    alert("❌ No pude cargar opciones de asignación.");
    modal.classList.add("hidden");
    return;
  }
  if (!Array.isArray(choices) || choices.length === 0) {
    alert("⚠️ No hay opciones disponibles para asignar.");
    modal.classList.add("hidden");
    return;
  }

  const opts = choices.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
  const code = getItemCode(rowData);
  const label = getItemLabel(rowData);

  const expiresBlock = expires
  ? `
    <label class="label base dark" for="assign-expires" style="display:block;margin-top:.5rem;">${esc(expiresLabel || "Expira (opcional)")}</label>
    <input id="assign-expires" type="date" style="width:100%;max-width:224px;padding:.35rem;border-radius:6px;" />
  `
  : "";

  content.innerHTML = `
    <h2 class="box-title-white">📌 Asignar</h2>
    <p class="label base dark">Item: <strong>${esc(code)}${label ? " — " + esc(label) : ""}</strong></p>

    <label class="label base dark" for="assign-choice">Seleccionar</label>
    <select id="assign-choice" style="width:100%;max-width:224px;padding:.35rem;margin:.25rem 0">${opts}</select>

    ${expiresBlock}

    <div class="modal-buttons" style="margin-top:1rem;display:flex;gap:.5rem;justify-content:flex-end;">
      <button class="button button-secondary" id="closeAssign">Cancelar</button>
      <button class="button button-success" id="confirmAssign">Asignar</button>
    </div>
  `;

  const close = () => modal.classList.add("hidden");
  document.getElementById("closeAssign").onclick = close;
  document.getElementById("confirmAssign").onclick = async () => {
    const selected = document.getElementById("assign-choice").value;
    if (!selected) return alert("Selecciona una opción.");

    // Payload dinámico, sin hardcode del campo
    const payload = { [payloadField]: isNaN(Number(selected)) ? selected : Number(selected) };
    const expiresInput = document.getElementById("assign-expires");
    if (expiresInput && expiresInput.value) {
      payload.expires_at = expiresInput.value;
    }

    const btn = document.getElementById("confirmAssign");   // 👈 nuevo
    btn.disabled = true;                                     // 👈 nuevo
    try {
      await postAndAlertJson(url, payload);
      close();
    } finally {
      btn.disabled = false;                                  // 👈 nuevo
    }
  };
}

// 👉 RELEASE (usa la misma ruta dinámica, sin modal)
export function handleReleaseAction(rowData) {
  const url = buildActionUrl("release", rowData);
  if (!url) return alert("❌ Error interno (URL).");

  const code = getItemCode(rowData);
  const label = getItemLabel(rowData);
  if (!confirm(`¿Liberar asignación de ${code}${label ? " — " + label : ""}?`)) return;

  postAndAlertJson(url, {}); // payload vacío
}

// 🔁 Diccionario central de acciones
const specialActions = {
  activate: handleActivateAction,
  deactivate: handleDeactivateAction,
  assign: handleAssignAction,
  release: handleReleaseAction,
  extra: handleExtraAction,
  print: handlePrintAction
};

// 🎯 Dispatcher exportable
export function dispatchSpecialAction(action, rowData) {
  const handler = specialActions[action];
  if (typeof handler === "function") {
    handler(rowData);
  } else {
    console.warn(`⚠️ Acción especial no reconocida: ${action}`);
  }
}
