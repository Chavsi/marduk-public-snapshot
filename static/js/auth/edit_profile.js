document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Edit Profile JS Loaded!");

    const editForm = document.getElementById("EditProfileForm");

    if (!editForm) {
        console.warn("⚠ No estamos en la página de edición de perfil. Saliendo...");
        return;
    }

    async function loadProfile() {
        try {
            const response = await fetch("/user/profile/view", {
                credentials: "same-origin",
                headers: { "X-Requested-With": "XMLHttpRequest" }
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("⚠ Respuesta no es JSON, posiblemente HTML.");
            }

            const data = await response.json();

            if (response.ok) {
                document.getElementById("name").value = data.name || "";
                document.getElementById("username").value = data.username || "";
                document.getElementById("email").value = data.email || "";
                document.getElementById("phone").value = data.phone_number || "";
                document.getElementById("address").value = data.address || "";
            } else {
                alert("❌ Error cargando perfil: " + (data.error || "Intenta de nuevo."));
            }
        } catch (error) {
            console.error("🚨 Error en loadProfile:", error);
        }
    }

    loadProfile();

    function clearProfileErrors() {
        const fields = ["nameError", "addressError"];
        for (const id of fields) {
            const el = document.getElementById(id);
            if (el) el.innerText = "";
        }
    }

    function showProfileErrors(errors = {}, generalError = "") {
        const mapping = {
            nameError: { id: "name", error: errors.name },
            addressError: { id: "address", error: errors.address }
        };

        let focused = false;

        for (const [errorId, { id: fieldId, error }] of Object.entries(mapping)) {
            const errorElement = document.getElementById(errorId);
            const inputElement = document.getElementById(fieldId);

            if (errorElement) {
                errorElement.innerText = error || "";
            }

            if (error && inputElement && !focused) {
                inputElement.focus();
                focused = true;
            }
        }

        if (generalError) {
            alert("❌ " + generalError);
        }
    }

    editForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearProfileErrors();

        const formData = {
            name: document.getElementById("name").value.trim(),
            username: document.getElementById("username").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone_number: document.getElementById("phone").value.trim(),
            address: document.getElementById("address").value.trim(),
        };

        const csrfToken = document.cookie.split("; ")
            .find(row => row.startsWith("csrf_token="))
            ?.split("=")[1];

        if (!csrfToken) {
            alert("❌ Error: No se encontró el token CSRF.");
            return;
        }

        try {
            const response = await fetch("/user/profile/update", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Perfil actualizado correctamente.");
                window.location.href = "/user/profile/view";
            } else {
                console.error("❌ Error en actualización:", data.errors || data.error);
                showProfileErrors(data.errors, data.error);
            }

        } catch (error) {
            console.error("🚨 Error en el perfil:", error);
            alert("❌ Error inesperado. Intenta de nuevo.");
        }
    });
});
