// 📁 static/js/components/inline_dropdown_util.js
export function getDropdownEditor(values = []) {
  return function(cell, onRendered, success, cancel) {
    const editor = document.createElement("select");

    values.forEach(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      editor.appendChild(option);
    });

    editor.value = cell.getValue();

    editor.addEventListener("change", () => success(editor.value));
    editor.addEventListener("blur", () => cancel());

    onRendered(() => {
      editor.focus();
    });

    return editor;
  };
}
