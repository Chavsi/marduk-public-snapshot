// C:\web_project2\static\js\admin\users\inline_users_actions.module.js
export function attachInlineActionListeners(csrfToken) {
  const table = window.userTable;

  if (!table || !csrfToken) {
    console.warn("⚠️ Tabla o CSRF no disponibles para listeners.");
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

      row.getElement().querySelectorAll(".btn-save").forEach(btn => btn.style.display = "inline-block");
      row.getElement().querySelectorAll(".btn-cancel").forEach(btn => btn.style.display = "inline-block");

      // 🔒 Ocultar acciones normales mientras se edita
      row.getElement().querySelectorAll(".btn-edit").forEach(btn => btn.style.display = "none");
      row.getElement().querySelectorAll(".btn-delete").forEach(btn => btn.style.display = "none");
      row.getElement().querySelectorAll(".btn-view").forEach(btn => btn.style.display = "none");
    }

    if (action === "save") {
      saveEditUser(row, csrfToken);
    }

    if (action === "view") {
      const url = `/admin/users/view/${id}`;
      window.open(url, "_blank");
    }

    if (action === "cancel") {
      fetch(`/admin/users/api/get-user/${id}`)
        .then(res => res.json())
        .then(originalData => {
          row.update(originalData);
          row.getElement().querySelectorAll(".btn-save").forEach(btn => btn.style.display = "none");
          row.getElement().querySelectorAll(".btn-cancel").forEach(btn => btn.style.display = "none");
          row.getElement().querySelectorAll(".btn-edit, .btn-delete, .btn-view").forEach(btn => btn.style.display = "inline-block");
        })
        .catch(err => {
          console.warn("⚠️ Error al cancelar:", err);
          alert("❌ No se pudo cancelar los cambios.");
        });
    }

    if (action === "assign-plan") {
      const modal = document.getElementById("assignPlanModal");
      const selector = document.getElementById("planSelector");
      const confirmBtn = document.getElementById("confirmAssignPlan");
      const cancelBtn = document.getElementById("cancelAssignPlan");

      if (!modal || !selector || !confirmBtn || !cancelBtn) {
        console.error("❌ Modal de asignación de plan no encontrado.");
        return;
      }

      try {
        const res = await fetch("/admin/plans/api/available-plans");
        const plans = await res.json();

        selector.innerHTML = "";
        plans.forEach(plan => {
          const opt = document.createElement("option");
          opt.value = plan.id;
          opt.textContent = `${plan.role_value} → ${plan.name}`;
          selector.appendChild(opt);
        });

        modal.classList.remove("hidden");

        confirmBtn.onclick = async () => {
          const selectedId = selector.value;

          try {
            const response = await fetch(`/admin/plans/api/assign/${id}/${selectedId}`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
                "X-Requested-With": "XMLHttpRequest"
              },
            });

            const result = await response.json();
            if (result.success) {
              alert(result.message);

              const updatedRow = table.getRows().find(r => r.getData().id === result.user_id);
              if (updatedRow) {
                // Recargar los datos completos del usuario desde el backend
                fetch(`/admin/users/api/get-user/${result.user_id}`)
                  .then(res => res.json())
                  .then(data => {
                    updatedRow.update(data);
                    const rowElem = updatedRow.getElement();
                    rowElem.classList.add("row-flash");
                    setTimeout(() => rowElem.classList.remove("row-flash"), 1000);
                    rowElem.scrollIntoView({ behavior: "smooth", block: "center" });
                  })
                  .catch(err => {
                    console.warn("⚠️ Error al refrescar fila:", err);
                  });
                }
            } else {
              alert(result.message || "❌ Error al asignar plan.");
            }
          } catch {
            alert("❌ Error de red.");
          }

          modal.classList.add("hidden");
        };

        cancelBtn.onclick = () => modal.classList.add("hidden");

      } catch (err) {
        console.error("❌ Error al cargar planes:", err);
        alert("❌ No se pudieron cargar los planes.");
      }
    }

    if (action === "delete") {
      if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

      try {
        btn.disabled = true;

        const response = await fetch(`/admin/users/api/delete-user/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            "X-Requested-With": "XMLHttpRequest"
          },
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message || "✅ Usuario eliminado.");
          table.deleteRow(id);
        } else {
          alert(result?.error || "❌ No se pudo eliminar.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Error de red.");
      } finally {
        btn.disabled = false;
      }
    }
  });
}

function enableEdit(row) {
  row.getCells().forEach(cell => {
    const def = cell.getColumn().getDefinition();
    if (def && def.field !== "id" && def.editor) {
      try {
        cell.edit(true);
      } catch (err) {
        console.warn(`❌ Error al editar ${cell.getField()}:`, err);
      }
    }
  });
}

function saveEditUser(row, csrfToken) {
  const data = row.getData();
  const id = data.id;

  fetch(`/admin/users/api/edit-user/${id}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify(data)
  })
    .then(async res => {
      const result = await res.json().catch(() => {
        throw new Error("Respuesta no válida del servidor.");
      });

      if (!res.ok) {
        const msg = result?.error || "❌ Error desconocido del servidor.";
        alert(msg);
        return;
      }

      // Éxito
      fetch(`/admin/users/api/get-user/${id}`)
        .then(res => res.json())
        .then(updatedData => {
          row.update(updatedData);
          const rowElem = row.getElement();
          rowElem.classList.add("row-flash");
          setTimeout(() => rowElem.classList.remove("row-flash"), 1000);
        })
        .catch(err => {
          console.warn("⚠️ Error al refrescar después de editar:", err);
        });

      const rowElem = row.getElement();
        rowElem.querySelectorAll(".btn-save").forEach(btn => btn.style.display = "none");
        rowElem.querySelectorAll(".btn-cancel").forEach(btn => btn.style.display = "none");
        rowElem.querySelectorAll(".btn-edit, .btn-delete, .btn-view").forEach(btn => btn.style.display = "inline-block");
    })
    .catch(err => {
      console.error("❌ Error inesperado:", err);
      alert("❌ Fallo al guardar. Detalles: " + err.message);
    });
}
