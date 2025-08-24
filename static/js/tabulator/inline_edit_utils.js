// 📁 static/js/tabulator/inline_edit_utils.js

/**
 * Activa el modo edición para una fila de Tabulator.
 * @param {RowComponent} row - La fila a editar.
 */
export function enableEdit(row) {
  console.log("▶️ Activando edición de fila:", row.getData());
  row.getCells().forEach(cell => {
    const def = cell.getColumn().getDefinition();
    if (def && (typeof def.editor === "string" || typeof def.editor === "function")) {
      setTimeout(() => {
        if (cell.getElement().isConnected) {
          cell.edit();
        }
      }, 0);
    }
  });
  row.normalizeHeight();
  row.getTable().redraw(true);
}

/**
 * Guarda los cambios de una fila editada y los envía vía PATCH al servidor.
 * @param {RowComponent} row - La fila a guardar.
 * @param {string} csrfToken - Token CSRF para proteger la petición.
 * @param {string} apiBase - Ruta base de la API.
 */
export function saveEdit(row, csrfToken, apiBase) {
  const data = row.getData();
  const id = data.id;

  fetch(`${apiBase}/${id}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if (result && !result.error) {
        Object.assign(row.getData(), result.updated || data);
        row.getTable().redraw(true);
        row.getElement().querySelectorAll(".btn-save").forEach(btn => btn.style.display = "none");

        // 🟦 Agrega esto para el efecto flash
        const rowElem = row.getElement();
        rowElem.classList.add("row-flash");
        setTimeout(() => rowElem.classList.remove("row-flash"), 1000);

      } else {
        alert("❌ Error al guardar: " + (result.error || "desconocido"));
      }
    })
    .catch(err => {
      console.error("❌ Error al guardar:", err);
      alert("❌ Fallo inesperado.");
    });
}
