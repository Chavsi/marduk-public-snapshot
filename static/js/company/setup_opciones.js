import {
  showSpinnerMessage,
  showErrorMessage,
  showSuccessMessage,
} from "/static/js/utils/show_messages.js";


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form[action='/company/setup/setup_empresa/opciones']");
  const respuestaBox = document.getElementById("respuesta") || null;

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;
    const company_id = form.querySelector("input[name='company_id']").value;
    const copy_brands = form.querySelector("input[name='copy_brands']").checked;
    const copy_os = form.querySelector("input[name='copy_os']").checked;
    const copy_software = form.querySelector("input[name='copy_software']").checked;

    const formData = new URLSearchParams();
    formData.append("company_id", company_id);
    if (copy_brands) formData.append("copy_brands", "1");
    if (copy_os) formData.append("copy_os", "1");
    if (copy_software) formData.append("copy_software", "1");

    showSpinnerMessage(respuestaBox, "📦 Precargando catálogos... Esto tomará unos segundos");

    try {
      const response = await fetch("/company/setup/setup_empresa/opciones", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showSuccessMessage(respuestaBox, "✅ Catálogos precargados. Redirigiendo...");
        setTimeout(() => {
          window.location.href = data.redirect_url;
        }, 1000);
      } else {
        showErrorMessage(respuestaBox, `❌ ${data.error || "Error al completar el setup."}`);
      }
      // 🧼 Limpieza por si quedó colgado sin redirigir ni error
      setTimeout(() => {
        if (respuestaBox && respuestaBox.innerHTML.includes("Precargando")) {
          respuestaBox.innerHTML = "";
        }
      }, 8000);
      
    } catch (err) {
      console.error("❌ Error en setup_opciones:", err);
      showErrorMessage(respuestaBox, "⚠️ Error inesperado.");
    }
  });
});
