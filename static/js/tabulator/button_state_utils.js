// static/js/tabulator/button_state_utils.js

export function showButtons(row, actions = []) {
  const el = row.getElement();
  actions.forEach(action => {
    el.querySelectorAll(`[data-action='${action}']`).forEach(btn => btn.style.display = "inline-block");
  });
}

export function hideButtons(row, actions = []) {
  const el = row.getElement();
  actions.forEach(action => {
    el.querySelectorAll(`[data-action='${action}']`).forEach(btn => btn.style.display = "none");
  });
}

export function resetButtons(row) {
  const el = row.getElement();
  const all = ["edit", "save", "cancel", "delete", "view"];
  all.forEach(action => {
    const display = ["edit", "delete", "view"].includes(action) ? "inline-block" : "none";
    el.querySelectorAll(`[data-action='${action}']`).forEach(btn => btn.style.display = display);
  });
}
