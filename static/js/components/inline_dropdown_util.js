// Crea editores select reutilizables con valores dinámicos
export function getDropdownEditor(values = []) {
  return {
    editor: "list",
    editorParams: {
      values,
      clearable: false
    }
  };
}

// 🟢 Para valores complejos tipo [{ label, value }]
export function getDropdownEditorLabeled(values = []) {
  return function(cell, onRendered, success, cancel) {
    const editor = document.createElement("select");

    values.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = `${opt.label}`;
      editor.appendChild(option);
    });

    editor.value = cell.getValue();

    editor.addEventListener("change", () => success(editor.value));
    editor.addEventListener("blur", () => cancel());

    return editor;
  };
}
