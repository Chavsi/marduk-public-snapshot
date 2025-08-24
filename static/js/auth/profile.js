document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Cargando perfil...");

    // ✅ Verificar si estamos en la página correcta antes de continuar
    if (!document.getElementById("ProfileForm")) {
        console.warn("⚠ Este script no se ejecutará porque no estamos en la página de perfil.");
        return;
    }

    try {
        // ✅ 1️⃣ Verificar autenticación ANTES de cargar el perfil
        const authResponse = await fetch("/auth/status", {
            method: "GET",
            credentials: "same-origin",
            headers: { "X-Requested-With": "XMLHttpRequest" }
        });

        if (!authResponse.ok) throw new Error("❌ Error al verificar autenticación.");

        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            console.warn("⚠ Usuario no autenticado. No se puede cargar el perfil.");
            document.getElementById("profile-container").innerHTML = 
                "<p style='color: red;'>⚠ No estás autenticado. Inicia sesión para ver tu perfil.</p>";
            return;
        }

        console.log("✅ Usuario autenticado:", authData.username);

        // ✅ 2️⃣ Obtener CSRF Token SOLO si el usuario está autenticado
        const csrfResponse = await fetch("/csrf/get", {
            method: "GET",
            credentials: "same-origin",
            headers: { 
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        if (!csrfResponse.ok) throw new Error("❌ CSRF request fallido.");

        const csrfData = await csrfResponse.json();
        if (csrfData.csrf_token) {
            console.log("✅ CSRF Token actualizado:", csrfData.csrf_token);
        } else {
            throw new Error(`⚠ Error en CSRF: ${csrfData.error}`);
        }

        // ✅ 3️⃣ Obtener Datos del Perfil
        const profileResponse = await fetch("/user/profile/view", {
            method: "GET",
            credentials: "same-origin",
            headers: { "X-Requested-With": "XMLHttpRequest" }
        });

        if (profileResponse.status === 401) {
            console.warn("⚠ No autenticado. No se puede obtener el perfil.");
            document.getElementById("ProfileForm").innerHTML = 
                "<p style='color: red;'>⚠ No tienes permiso para ver esta página.</p>";
            return;
        }

        if (!profileResponse.ok) throw new Error("❌ Error al obtener el perfil.");

        const profileData = await profileResponse.json();
        console.log("✅ Datos del perfil recibidos:", profileData);

        // ✅ 4️⃣ Rellenar los datos en la página **solo si los elementos existen**
        const usernameEl = document.getElementById("username");
        const emailEl = document.getElementById("email");
        const nameEl = document.getElementById("name");
        const phoneEl = document.getElementById("phone");
        const addressEl = document.getElementById("address");

        if (usernameEl) usernameEl.textContent = profileData.username || "N/A";
        if (emailEl) emailEl.textContent = profileData.email || "N/A";
        if (nameEl) nameEl.textContent = profileData.name || "N/A";
        if (phoneEl) phoneEl.textContent = profileData.phone_number || "N/A";
        if (addressEl) addressEl.textContent = profileData.address || "N/A";

    } catch (error) {
        console.error("🚨 Error en la carga del perfil:", error.message);
        alert("❌ No se pudo cargar el perfil. Intenta nuevamente.");
    }
});
