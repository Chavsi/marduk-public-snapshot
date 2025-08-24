// static/js/utils/warning_utils.js
export function showNoDataWarning(containerId = "#catalog-warning", message = "⚠️ No hay datos para mostrar en este catálogo.") {
  const warningBox = document.querySelector(containerId);
  if (warningBox) {
    warningBox.textContent = message;
    warningBox.classList.remove("hidden");
  }
}
