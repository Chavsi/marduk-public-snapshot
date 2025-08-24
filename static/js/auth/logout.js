document.addEventListener("DOMContentLoaded", async function () {
  const logoutButtons = document.querySelectorAll("#btnLogout, #btnLogoutMobile"); // <- así
  if (!logoutButtons.length) return;

  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("🚪 Logout iniciado...");

      try {
        // 1) Verificar sesión
        const authResponse = await fetch("/auth/status", {
          method: "GET",
          credentials: "same-origin",
          headers: { "X-Requested-With": "XMLHttpRequest" }
        });
        const authData = await authResponse.json();
        if (!authData.authenticated) {
          window.location.href = "/";
          return;
        }

        // 2) Obtener CSRF fresco (evita cache)
        const csrfResponse = await fetch("/csrf/get", {
          method: "GET",
          credentials: "same-origin",
          headers: { "X-Requested-With": "XMLHttpRequest", "Cache-Control": "no-store" }
        });
        const { csrf_token } = await csrfResponse.json();
        if (!csrf_token) throw new Error("Sin CSRF");

        // 3) Hacer logout (OJO: agrega X-Requested-With)
        const response = await fetch("/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf_token,
            "X-Requested-With": "XMLHttpRequest"
          }
        });

        const ct = response.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          window.location.href = "/";
          return;
        }

        const data = await response.json();
        if (response.ok && data.success) {
          window.location.href = data.redirect || "/";
        } else {
          console.error("❌ Error en Logout:", data.error);
        }
      } catch (err) {
        console.error("❌ Error en el logout:", err);
      }
    });
  });
});
