async function login(event) {
event.preventDefault();

  const username = document.querySelector("#username").value.trim();
  const passwordInput = document.querySelector("#password");          // ⬅️ add
  const password = passwordInput.value.trim();
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content 
    || localStorage.getItem("csrf_token");

  const btn = document.querySelector("#loginButton");
  const msg = document.querySelector("#message");
  const remember = document.querySelector("#rememberMe")?.checked || false;

  const showMsg = (text, ok=false) => {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove("text-success","text-danger","show");
    msg.classList.add(ok ? "text-success" : "text-danger", "show");
  };

  if (!csrfToken) { showMsg("❌ Falta token CSRF."); return; }
  if (!username || !password) { showMsg("❌ Usuario y contraseña son obligatorios."); return; }

  console.log("🔍 Enviando datos al servidor...");

  try {
    btn && (btn.disabled = true);
    showMsg("⏳ Iniciando sesión…", true);
    
    const url = "/auth/login" + window.location.search;
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        "X-Requested-With": "XMLHttpRequest"  // ✅ Esto fuerza respuesta JSON
      },
      body: JSON.stringify({ username, password , remember })
    });

    // 🚀 Verificar si la respuesta es JSON válida
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      showMsg("⚠ Respuesta inesperada del servidor.");
      return;
    }

    const data = await response.json();

    if (response.ok) {
      showMsg("✅ Login exitoso. Redirigiendo…", true);
      window.location.href = data.redirect || "/";
    } else {
      passwordInput.value = "";
      showMsg(data.error || data.message || "❌ Error al iniciar sesión.");
    }
  } catch (error) {
    showMsg("❌ Error al conectar con el servidor.");
    console.error(error);
  } finally {
    btn && (btn.disabled = false);
  }
}

// Agregar evento al formulario
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("#LoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", login);
  }
});

