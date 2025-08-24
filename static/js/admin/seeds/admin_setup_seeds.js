document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("initCatalogsBtn");
  const responseBox = document.getElementById("setup-response");
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  if (!btn || !csrfToken) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    responseBox.textContent = "⏳ Procesando...";
    
    // Capturar valores de los checkboxes
    const seed_tests = document.querySelector("input[name='seed_tests']")?.checked;
    const seed_core = document.querySelector("input[name='seed_core']")?.checked;
    const seed_base = document.querySelector("input[name='seed_base']")?.checked;
    const seed_aux = document.querySelector("input[name='seed_aux']")?.checked;

    try {
      const res = await fetch("/admin/seeds/setup/init-platform-catalogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          seed_tests,
          seed_core,
          seed_base,
          seed_aux
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        responseBox.textContent = "✅ " + data.message;
      } else {
        responseBox.textContent = "❌ Error: " + (data.error || "Desconocido");
      }
    } catch (error) {
      console.error("Error al sembrar catálogos:", error);
      responseBox.textContent = "❌ Error inesperado.";
    } finally {
      btn.disabled = false;
    }
  });
});

