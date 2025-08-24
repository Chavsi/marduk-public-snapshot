// static/js/company/select_company.js
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action='select-company']");
    if (!btn) return;

    const companyId = btn.dataset.companyId;
    const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

    try {
      const response = await fetch(`/company/select/${companyId}`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = result.redirect_url;
      } else {
        alert(result.error || "❌ Error al seleccionar empresa.");
      }
    } catch (err) {
      console.error("Error al seleccionar empresa:", err);
      alert("⚠️ No se pudo completar la solicitud.");
    }
  });
});
