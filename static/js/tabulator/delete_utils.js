/**
 * Elimina un item desde API y lo remueve de la tabla si fue exitoso.
 * @param {Object} options - Configuración de eliminación.
 * @param {number} options.id - ID del item a eliminar.
 * @param {string} options.apiUrl - URL base de la API.
 * @param {string} options.csrfToken - Token CSRF para la petición.
 * @param {Tabulator} options.table - Instancia de Tabulator.
 * @param {boolean} [options.confirm=true] - Si debe mostrar confirmación al usuario.
 */
export function deleteItem({ id, apiUrl, csrfToken, table, confirm = true }) {
  if (confirm && !window.confirm(`❌ ¿Eliminar item ${id}?`)) {
    return;
  }

  fetch(`${apiUrl}/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": csrfToken,
      "X-Requested-With": "XMLHttpRequest"
    }
  }).then(res => {
    if (res.ok) {
      const row = table.getRow(id);
      if (row) row.delete();
    } else {
      alert("❌ Error al eliminar.");
    }
  }).catch(err => {
    console.error("❌ Fallo en la eliminación:", err);
    alert("❌ Fallo inesperado.");
  });
}
