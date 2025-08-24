// static/js/auth/reset_password.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const messageBox = document.getElementById("flash-messages");
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  if (!form || !csrfToken) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = form.dataset.action;
    const token = form.dataset.token;

    const newPassword = document.getElementById("new_password")?.value?.trim();
    const confirmPassword = document.getElementById("confirm_password")?.value?.trim();

    if (!newPassword || !confirmPassword) {
      showMessage("❌ Debes completar ambos campos.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("❌ Las contraseñas no coinciden.", "error");
      return;
    }

    const allValid = [...document.querySelectorAll(".password-criteria-row .password-label")]
      .every(span => span.classList.contains("valid"));

      if (!allValid) {
        showMessage("❌ La contraseña no cumple con los requisitos de seguridad.", "error");
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
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        const errors = result?.errors;
        let msg = "";

        if (Array.isArray(errors)) {
          msg = errors.map(e => `❌ ${e}`).join("\n");
        } else if (errors && typeof errors === "object") {
          msg = Object.values(errors).map(e => `❌ ${e}`).join("\n");
        } else {
          msg = result?.error || "❌ Error al restablecer la contraseña.";
        }

        showMessage(msg, "error");
        return;
      }

      showMessage("✅ Contraseña actualizada correctamente. Ahora puedes iniciar sesión.", "success");

      // Opcional: redirigir al login luego de unos segundos
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 3000);

    } catch (err) {
      console.error("❌ Error en la solicitud:", err);
      showMessage("❌ Error inesperado en el servidor.", "error");
    }
  });

  function showMessage(text, type = "info") {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `flashes text-${type}`;
  }
});
