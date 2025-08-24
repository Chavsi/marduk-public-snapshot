document.getElementById("crear-empresa-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const respuestaBox = document.getElementById("respuesta");
  respuestaBox.innerHTML = ""; // Limpia mensajes anteriores

  const name = document.getElementById("name").value.trim();
  const note = document.getElementById("note").value;
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  // Validación mínima en frontend
  if (!name) {
    respuestaBox.innerHTML = `<p class="alert error">⚠️ El nombre de la empresa es obligatorio.</p>`;
    return;
  }

  try {
    const response = await fetch("/company/setup/create", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      body: JSON.stringify({ name, note })
    });

    const data = await response.json();

    if (data.success) {
      respuestaBox.innerHTML = `<p class="alert success">✅ Empresa creada con éxito. Redirigiendo...</p>`;
      setTimeout(() => {
        // Redirige a la URL proporcionada por el servidor
        //window.location.href = `/assets/setup_opciones/${data.empresa_id}`;
        window.location.href = data.redirect_url;
      }, 1000);
    } else {
      respuestaBox.innerHTML = `<p class="alert error">❌ ${data.error}</p>`;
    }

  } catch (err) {
    respuestaBox.innerHTML = `<p class="alert error">⚠️ Error inesperado al procesar la respuesta.</p>`;
    console.error("❌ Error capturado:", err);
  }
});

