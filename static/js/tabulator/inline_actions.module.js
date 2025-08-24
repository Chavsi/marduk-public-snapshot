// inline_actions.module.js

export function attachInlineActionListeners({ table, csrfToken, apiBase, viewUrlBase = null }) {
  if (!table || !csrfToken || !apiBase) {
    console.warn("⚠️ Parámetros insuficientes para listeners.");
    return;
  }

  document.body.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);
    const row = table.getRows().find(r => r.getData().id === id);
    if (!row) return;

    if (action === "edit") {
      enableEdit(row);
      toggleEditButtons(row, true);
    }

    if (action === "cancel") {
      row.getTable().setData(row.getTable().getData()); // Reestablece el contenido
      toggleEditButtons(row, false);
    }

    if (action === "save") {
      await saveEdit(row, csrfToken, apiBase);
      toggleEditButtons(row, false);
    }

    if (action === "delete") {
      if (confirm(`¿Eliminar item ${id}?`)) {
        await deleteItem(id, csrfToken, apiBase, table);
      }
    }

    if (action === "view") {
      const url = btn.dataset.url || (viewUrlBase ? viewUrlBase.replace("__ID__", id) : "#");
      window.location.href = url;
    }
  });
}

function enableEdit(row) {
  row.getCells().forEach(cell => {
    const def = cell.getColumn().getDefinition();
    if (def && (typeof def.editor === "string" || typeof def.editor === "function")) {
      setTimeout(() => {
        if (cell.getElement().isConnected) cell.edit();
      }, 0);
    }
  });
  row.normalizeHeight();
  row.getTable().redraw(true);
}

function toggleEditButtons(row, editing) {
  row.getElement().querySelectorAll(".btn-save").forEach(btn => btn.style.display = editing ? "inline-block" : "none");
  row.getElement().querySelectorAll(".btn-cancel").forEach(btn => btn.style.display = editing ? "inline-block" : "none");
}

async function saveEdit(row, csrfToken, apiBase) {
  const data = row.getData();
  const id = data.id;
  try {
    const response = await fetch(`${apiBase}/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result && !result.error) {
      Object.assign(row.getData(), result.updated || data);
      row.getTable().redraw(true);
    } else {
      alert("❌ Error al guardar: " + (result.error || "desconocido"));
    }
  } catch (err) {
    console.error("❌ Error al guardar:", err);
    alert("❌ Fallo inesperado.");
  }
}

async function deleteItem(id, csrfToken, apiBase, table) {
  try {
    const response = await fetch(`${apiBase}/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: {
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (response.ok) {
      const row = table.getRow(id);
      if (row) row.delete();
    } else {
      alert("❌ Error al eliminar.");
    }
  } catch (err) {
    console.error("❌ Error al eliminar:", err);
    alert("❌ Fallo inesperado.");
  }
}
