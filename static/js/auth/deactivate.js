document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('deactivate-form');
  const ack  = document.getElementById('confirm_ack');
  const input = document.getElementById('confirm_username');
  const btn   = document.getElementById('confirm_btn');
  const mismatch = document.getElementById('mismatch');
  if (!form || !ack || !input || !btn) return;

  const expected = form.dataset.expected || '';

  function validate() {
    const typed = input.value.trim();
    const ok = ack.checked && typed === expected;
    btn.disabled = !ok;
    btn.setAttribute('aria-disabled', String(!ok)); // a11y
    if (mismatch) {
      // muestra el error solo si hay algo escrito y no coincide (y la casilla está marcada)
      mismatch.style.display = (ack.checked && typed && typed !== expected) ? 'block' : 'none';
    }
  }

  ack.addEventListener('change', validate);
  input.addEventListener('input', validate);
  validate(); // estado inicial

  // Evita doble submit
  form.addEventListener('submit', (e) => {
    if (btn.disabled) { e.preventDefault(); return; }
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.textContent = "Procesando…";
  });
});

