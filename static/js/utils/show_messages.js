export function showSpinnerMessage(el, message = "Procesando...") {
  if (!el) return;
  el.innerHTML = `
    <p class="alert info">
      ${message} <span class="spinner"></span>
    </p>`;
}

export function showErrorMessage(el, message = "❌ Ocurrió un error") {
  if (!el) return;
  el.innerHTML = `<p class="alert error">${message}</p>`;
}

export function showSuccessMessage(el, message = "✅ Completado") {
  if (!el) return;
  el.innerHTML = `<p class="alert success">${message}</p>`;
}
