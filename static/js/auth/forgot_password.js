// static/js/auth/forgot_password.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-password-form");
  const messageBox = document.getElementById("message");
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  if (!form || !csrfToken) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = form.getAttribute("data-action");
    const email = form.querySelector("#email")?.value?.trim();

    if (!email || !validateEmail(email)) {
      showMessage("❌ Ingresa un correo válido.", "error");
      return;
    }

    try {
      const response = await fetch(action, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        const msg = result?.error || "❌ Error al procesar la solicitud.";
        showMessage(msg, "error");
        return;
      }

      showMessage("✅ Enlace de recuperación enviado a tu correo.", "success");

    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      showMessage("❌ Ocurrió un error inesperado.", "error");
    }
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showMessage(text, type = "info") {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `text-${type}`;
  }
});
