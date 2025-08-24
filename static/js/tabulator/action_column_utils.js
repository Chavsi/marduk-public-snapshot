// C:\web_project2\static\js\tabulator\action_column_utils.js
export function generateActionColumn({ editable, deletable, viewUrlBase }) {
  return {
    title: "Acciones",
    field: "actions",
    formatter: (cell) => {
      const rowData = cell.getRow().getData();
      const id = rowData.id;
      const buttons = [];

      if (deletable) {
        buttons.push(`<button class="btn-mini red" data-id="${id}" data-action="delete">🗑️</button>`);
      }
      if (editable) {
        buttons.push(`<button class="btn-mini yellow" data-id="${id}" data-action="edit">✏️</button>`);
        buttons.push(`<button class="btn-mini green btn-save" data-id="${id}" data-action="save" style="display:none;">💾</button>`);
        buttons.push(`<button class="btn-mini gray btn-cancel" data-id="${id}" data-action="cancel" style="display:none;">❌</button>`);
      }

      const viewUrl = viewUrlBase?.replace("__ID__", id) || `#view-${id}`;
      buttons.push(`<button class="btn-mini blue" data-id="${id}" data-action="view" data-url="${viewUrl}">👁️</button>`);

      return buttons.join(" ");
    },
    minWidth: 60,
    hozAlign: "center",
    headerSort: false,
    resizable: true,
  };
}
