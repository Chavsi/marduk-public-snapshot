// C:\web_project2\static\js\tabulator\model_table.module.js
import { initTabulatorTable } from "/static/js/tabulator/tabulator_loader.js";
import { generateDynamicColumns } from "/static/js/tabulator/dynamic_column_utils.js";
import { generateActionColumn } from "/static/js/tabulator/action_column_utils.js";
import { showNoDataWarning } from "/static/js/utils/warning_utils.js";
import { resolveColumnsOrder } from "/static/js/tabulator/column_order_utils.js";
import { enableEdit, saveEdit } from "/static/js/tabulator/inline_edit_utils.js";
import { deleteItem } from "/static/js/tabulator/delete_utils.js";
import { showButtons, hideButtons, resetButtons } from "/static/js/tabulator/button_state_utils.js";
import { dispatchSpecialAction } from "/static/js/tabulator/action_handlers.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".tabulator-container");
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  const tableId = container?.id; 
  const modelName = container?.dataset.model;
  const viewTemplate = container?.dataset.viewUrlTemplate || "";

  const createBtn = document.querySelector("#btn-create-item");
  if (createBtn) {
    const btnModelName = createBtn.dataset.model;
    const urlTemplate = createBtn.dataset.urlTemplate;

    if (urlTemplate) {
      const finalUrl = urlTemplate.replace("__MODEL__", btnModelName);
      createBtn.addEventListener("click", () => {
        window.location.href = finalUrl;
      });
    }
  }

  // === Import: navegación igual que Create ===
  const importBtn = document.querySelector("#btn-import");
  if (importBtn) {
    const importModel = importBtn.dataset.model;
    const importTpl   = importBtn.dataset.urlTemplate;

    if (importModel && importTpl) {
      importBtn.addEventListener("click", () => {
        const finalUrl = importTpl.replace("__MODEL__", importModel);
        window.location.href = finalUrl;
      });
    } else {
      console.warn("⚠️ Botón Import: faltan data-model o data-url-template.");
    }
  }

  if (!modelName || !csrfToken) return;

  const apiUrl = container?.dataset.saveUrl;

  const form = document.querySelector("#filters-form");
  let filterParams = "";

  async function reloadData() {
    const url = filterParams ? `${apiUrl}?${filterParams}` : apiUrl;

    try {
      const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        }
      });

      const json = await response.json();

      // ✅ Un único total
      const total = json.total_items ?? (Array.isArray(json.data) ? json.data.length : 0);
      if (container) container.dataset.totalItems = String(total);
      window._lastTotalItems = total;

      const data = Array.isArray(json.data) ? json.data : [];
      window.catalogTable.setData(data);
    } catch (err) {
      console.error("❌ Error al recargar con filtros:", err);
    }
  }

  window.reloadCatalogData = reloadData;

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
      }
      filterParams = params.toString();
      reloadData();
    });

    const clearBtn = form.querySelector(".clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        const inputs = form.querySelectorAll("input, select");
        inputs.forEach((el) => el.value = ""); // Limpiar todos los valores

        filterParams = "";  // Limpiar filtros activos
        reloadData();       // Recargar datos completos
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  try {
    const response = await fetch(apiUrl, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    const json = await response.json();
    /////AQUI2???
    // 👇 NEW: persiste el total inicial
    const total = json.total_items ?? (Array.isArray(json.data) ? json.data.length : 0);
    if (container) container.dataset.totalItems = String(total);

    const foreignChoices = json.foreign_choices || {};
    //console.log("🌐 foreignChoices:", foreignChoices); // 🔍 debug opcional
    const data = Array.isArray(json.data) ? json.data : [];
    const sample = data[0] || {};
    
    const columnsOrder = resolveColumnsOrder(json, sample);
    
    // 🔍 Campos meta del modelo
    //console.log("🧾 Campos excluidos:", json.excluded_fields);
    //console.log("🛠️ Campos editables:", json.writable_fields);

    if (!Array.isArray(data) || data.length === 0) {
      // total ya está calculado arriba
      if (container && typeof total !== "undefined") {
        container.dataset.totalItems = String(total);
      }
      console.warn("⚠️ No hay datos para mostrar en el catálogo.");
      showNoDataWarning();
      return;
    }

    const editable = container?.dataset.editable === "true";
    const deletable = container?.dataset.deletable === "true";

    //console.log("📦 Config", { editable, deletable, modelName });
    //console.log("🧩 Datos de muestra:", data[0]);

    const readonlyFields = ["created_at", "updated_at"];

    const excluded = Array.isArray(json.excluded_fields) ? json.excluded_fields : [];
    const writables = Array.isArray(json.writable_fields) ? json.writable_fields : [];

    const dynamicColumns = generateDynamicColumns(sample, columnsOrder, {
      editable,
      readonlyFields,
      excludedFields: excluded,
      writableFields: writables,
      foreignOptions: foreignChoices
    });

    //console.table(data, dynamicColumns.map(col => col.field));
    // ⬇️ aplicar títulos del backend (Plan, Role, etc.)
    const columnsTitles = json.columns_titles || {};
    dynamicColumns.forEach(col => {
      if (columnsTitles[col.field]) col.title = columnsTitles[col.field];
    });
    const actionColumn = generateActionColumn({
      editable,
      deletable,
      viewUrlBase: viewTemplate
    });

    const columns = [actionColumn, ...dynamicColumns];

    window.catalogTable = initTabulatorTable({
      elementId: "#model-table",
      columns,
      csrfToken,
      data: [],
      onDelete: (id) => {
        fetch(`${apiUrl}/${id}`, {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            "X-CSRFToken": csrfToken,
            "X-Requested-With": "XMLHttpRequest"
          }
        }).then((res) => {
          if (res.ok) {
            const row = window.catalogTable.getRow(id);
            if (row) row.delete();
          } else {
            alert("❌ Error al eliminar.");
          }
        });
      }
    });

    // BLOQUE para Total de REGISTROS
    window.catalogTable.on("dataLoaded", function(data){
      const total = (typeof window._lastTotalItems === "number")
        ? window._lastTotalItems
        : (Array.isArray(data) ? data.length : 0);

      // ☂️ Scoping al contenedor de ESTA tabla
      const paginator = window.catalogTable.element.querySelector(".tabulator-paginator");
      if (!paginator) return;

      let totalSpan = paginator.querySelector("#tabla-total-registros");
      if (!totalSpan) {
        totalSpan = document.createElement("span");
        totalSpan.id = "tabla-total-registros";
        totalSpan.className = "tabla-total-label";
        totalSpan.style.marginLeft = "auto";
        totalSpan.style.padding = "0.4rem 1rem";
        totalSpan.style.fontSize = "0.9rem";
        totalSpan.style.color = "#ddd";
        paginator.appendChild(totalSpan);
      }

      totalSpan.textContent = `📊 Total registros: ${total}`;
    });
    // Final bloque total REGISTROS

    window.catalogTable.modelName = modelName;

    window.catalogTable.on("tableBuilt", () => {
      //console.log("✅ Tabulator construido, cargando datos...");
      window.catalogTable.setData(data);
    });

    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id);
      const row = window.catalogTable.getRows().find(r => r.getData().id === id);
      if (!row) return;

      const saveUrl = container?.dataset.saveUrl;

      if (action === "edit") {
        enableEdit(row);
        row._originalData = { ...row.getData() };  // backup
        showButtons(row, ["save", "cancel"]);
        hideButtons(row, ["edit", "delete", "view"]);
      }

      if (action === "cancel") {
        if (row._originalData) {
          row.update(row._originalData); // Restaura la fila
          delete row._originalData;
        }
        resetButtons(row);
        row.getTable().redraw(true);
      }

      if (action === "save") {
        saveEdit(row, csrfToken, saveUrl);
        resetButtons(row);
      }

      if (action === "delete") {
        deleteItem({
          id,
          apiUrl: saveUrl,
          csrfToken,
          table: window.catalogTable,
          confirm: true
        });
      }

      if (action === "view") {
        const url = btn.dataset.url;
        if (url) {
          window.location.href = url;
        }
      }
    });
    
    // 🎯 Listener único para todas las acciones especiales
    document.body.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      
      const row = window.catalogTable.getRows().find(r => r.getData().id == id);
      if (!row) return;
      
      const rowData = row.getData();
      
      // ✅ Solo despacha si es acción especial válida
      if (["print", "assign", "release", "extra", "activate", "deactivate"].includes(action)) {
        dispatchSpecialAction(action, rowData);
      }
    });
    
  } catch (err) {
    console.error("❌ Error al cargar datos del catálogo:", err);
  }
});
