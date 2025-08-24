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

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // DEBUG: ver exactamente qué campos salen del form
    console.group("[CREATE][DEBUG] Payload saliente");
    const entries = [...formData.entries()];
    console.table(entries.map(([k, v]) => ({ key: k, value: v })));
    console.log("Object.fromEntries(data) ->", data);
    console.groupEnd();

    try {
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

      const result = await res.json();

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
    }
  });
});
