import { getDropdownEditor } from "/static/js/tabulator/dropdown_utils.js";

/**
 * Genera columnas dinámicas para Tabulator desde una muestra de datos.
 * @param {Object} sample - Objeto de muestra con las claves.
 * @param {Array} columnOrder - Orden personalizado de claves o columnas [{field, title}]
 * @param {Object} options - Opciones de configuración.
 * @param {boolean} options.editable - Si los campos son editables.
 * @param {Array} [options.readonlyFields=[]] - Campos que deben ser solo lectura.
 * @returns {Array} Lista de definiciones de columnas para Tabulator.
 */

function labelize(field) {
  return field.replace("_id", "").replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
}

export function generateDynamicColumns(sample, columnOrder, options = {}) {
  const {
    editable = false,
    readonlyFields = ["created_at", "updated_at"],
    excludedFields = [],
    writableFields = null,
    foreignOptions = {}
  } = options;

  const specialIcons = {
    extra: "⚡", print: "🖨️", assign: "📌", release: "🔓", activate: "✅", deactivate: "❌"
  };

  const specialLabels = {
    extra: "Extra", print: "", assign: "Asignar", release: "Liberar", activate: "Activar", deactivate: "Desactivar"
  };

  const specialColors = {
    extra: "blue", print: "gray", assign: "blue", release: "red", activate: "green", deactivate: "red"
  };

  const isSpecial = field => field in specialIcons;

  const filteredOrder = columnOrder.filter(col => {
    const field = typeof col === "string" ? col : col.field;
    return !excludedFields.includes(field);
  });

  return filteredOrder
    .filter(col => {
      const field = typeof col === "string" ? col : col.field;
      return isSpecial(field) || field in sample;
    })
    .map(col => {
      const field = typeof col === "string" ? col : col.field;
      const title = typeof col === "string" ? labelize(field) : col.title;

      const isForeign = foreignOptions.hasOwnProperty(field);
      const isEditable = editable && !readonlyFields.includes(field) && (!writableFields || writableFields.includes(field));
      const isFixed = ["id", "item_id"].includes(field) || isSpecial(field);

      if (isSpecial(field)) {
        return {
          field,
          title: specialLabels[field],
          hozAlign: "center",
          headerSort: false,
          resizable: false,
          minWidth: 54,
          cssClass: `column-bg-${specialColors[field]}`,
          titleFormatter: () => `
            <div class="header-action-label" style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
              <span>${specialIcons[field]}</span>
              <small>${specialLabels[field]}</small>
            </div>`,
          formatter: cell => {
            const row = cell.getRow().getData();
            return `
              <div class="cell-bg-${specialColors[field]}">
                <button class="btn-action ${specialColors[field]}" data-action="${field}" data-id="${row.id}" data-itemid="${row.item_id || ''}">
                  ${specialIcons[field]}
                </button>
              </div>
            `;
          }
        };
      }

      const column = {
        field,
        title,
        hozAlign: "left",
        sorter: "string",
        resizable: true
      };

      if (isFixed) {
        column.width = 68;
      } else {
        column.minWidth = 54;
      }

      if (isEditable) {
        if (isForeign) {
          const optionsArray = Object.entries(foreignOptions[field] || {}).map(
            ([value, label]) => ({ value, label })
          );
          column.editor = getDropdownEditor(optionsArray);
          column.formatter = cell => {
            const value = cell.getValue();
            const opt = optionsArray.find(o => o.value == value);
            return opt ? opt.label : value;
          };
        } else {
          column.editor = "input";
        }
      } else {
        column.editor = false;
      }

      return column;
    });
}
