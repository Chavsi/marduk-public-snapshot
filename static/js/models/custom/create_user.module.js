// CREATE USER MODULE
// 📌 Función compartida para obtener modelName desde URL
function getModelNameFromPath(anchor) {
  const parts = window.location.pathname.split("/");
  const index = parts.indexOf(anchor);
  return index !== -1 && index + 1 < parts.length ? parts[index + 1] : null;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#create-form");
  if (!form) return;

  // ⬇️ Nuevo: leer del dataset del form
  const modelName  = form.dataset.modelName || getModelNameFromPath("catalogs"); // fallback opcional
  const actionUrl  = form.dataset.actionUrl || null;
  const redirectUrl= form.dataset.redirectUrl || null;

  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  if (!modelName || !actionUrl || !csrfToken || !redirectUrl) {
    console.error("❌ Configuración incompleta:", { modelName, actionUrl, csrfToken, redirectUrl });
    alert("Error interno.");
    return;
  }

  const errorDiv = document.querySelector("#catalogerror");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.classList.add("hidden");
      errorDiv.classList.remove("show");
    }

    const submitBtn = form.querySelector('button[type="submit"]'); // NEW
    submitBtn?.setAttribute("disabled", "disabled");               // NEW

    try {
      //const formData = new FormData(form);

      // NEW: construir objeto, trim de strings y no enviar password vacío
      // construir objeto limpio
      const data = Object.fromEntries(new FormData(form).entries());
      for (const k in data) if (typeof data[k] === "string") data[k] = data[k].trim();

      // no enviar password vacío
      if ("password" in data && !data.password) delete data.password;

      // ✅ validar confirmación
      if (data.password && data.confirm_password && data.password !== data.confirm_password) {
        alert("❌ Las contraseñas no coinciden.");
        submitBtn?.removeAttribute("disabled");
        return;
      }

      // ❇️ no enviar confirm_password al backend
      if ("confirm_password" in data) delete data.confirm_password;

      // DEBUG: ver exactamente qué campos salen del form
      console.group("[CREATE][DEBUG] Payload saliente");
      console.table(Object.entries(data).map(([k, v]) => ({ key: k, value: v })));
      console.groupEnd();

      const res = await fetch(actionUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(data)
      });

      let text = await res.text();                                 // NEW
      let result;                                                  // NEW
      try { result = JSON.parse(text); }                           // NEW
      catch { result = { error: text }; }     

      if (res.ok) {
        alert("✅ Elemento creado correctamente");
        window.location.href = redirectUrl;
      } else {
        const msg = result.error || "Error desconocido.";
        console.warn("⚠️ Error en creación:", msg);

        if (errorDiv) {
          errorDiv.textContent = msg;
          errorDiv.classList.remove("hidden");
          errorDiv.classList.add("show");

          const clearOnInput = () => {
            errorDiv.textContent = "";
            errorDiv.classList.remove("show");
            errorDiv.classList.add("hidden");
            form.removeEventListener("input", clearOnInput);
          };
          form.addEventListener("input", clearOnInput);

          setTimeout(() => {
            errorDiv.classList.remove("show");
            errorDiv.classList.add("hidden");
            form.removeEventListener("input", clearOnInput);
          }, 15000);
        } else {
          alert("❌ " + msg);
        }
      }

    } catch (err) {
      console.error("❌ Error en creación:", err);
      alert("❌ Fallo inesperado.");
    } finally {
      submitBtn?.removeAttribute("disabled"); // NEW
    }
  });
});
