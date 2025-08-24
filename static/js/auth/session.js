document.addEventListener("DOMContentLoaded", async function () {
    //console.log("🚀 Iniciando ping de sesión...");

    try {
        // Paso 0: Activar sesión vacía
        await fetch("/session/ping", {
            method: "GET",
            credentials: "same-origin"
        });

        //console.log("✅ Sesión inicializada (ping)");

        // Paso 1: Verificar estado de autenticación
        const authResp = await fetch("/auth/status", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const authData = await authResp.json();
        //console.log("🔍 Estado de autenticación:", authData);

        if (authData.authenticated) {
            localStorage.setItem("user_id", authData.user_id || "");
            localStorage.setItem("username", authData.username || "");
            //console.log("✅ Logueado como:", authData.username);
        } else {
            //console.log("⚠ Usuario no autenticado.");
            localStorage.removeItem("user_id");
            localStorage.removeItem("username");
        }

        // Paso 2: Obtener token CSRF si es posible
        const csrfResp = await fetch("/csrf/get", {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        if (csrfResp.ok) {
            const csrfData = await csrfResp.json();
            if (csrfData.csrf_token) {
                localStorage.setItem("csrf_token", csrfData.csrf_token);
                //console.log("✅ CSRF Token guardado:", csrfData.csrf_token);
            }
        }

    } catch (err) {
        // Silencio intencional: 403 por CSRF sin sesión activa es un comportamiento esperado.
    }
});


