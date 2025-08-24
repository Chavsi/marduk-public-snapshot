console.log("✅ Register JS Loaded!");
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("#RegisterForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            console.log("📌 Register form submitted!");

            clearRegisterErrors();

            const formData = {
                name: document.querySelector("#name")?.value.trim() || "",
                username: document.querySelector("#username")?.value.trim() || "",
                email: document.querySelector("#email")?.value.trim() || "",
                phone_number: document.querySelector("#phone_number")?.value.trim() || null,
                address: document.querySelector("#address")?.value.trim() || null,
                password: document.querySelector("#password")?.value.trim() || "",
                confirm_password: document.querySelector("#confirm_password")?.value.trim() || ""
            };

            if (!formData.name || !formData.username || !formData.email || !formData.password) {
                alert("❌ Todos los campos obligatorios deben estar completos.");
                return;
            }

            if (formData.password !== formData.confirm_password) {
                document.getElementById("confirmPasswordError").innerText = "❌ Las contraseñas no coinciden.";
                return;
            }

            const csrfToken = getCSRFTokenFromMeta();
            if (!csrfToken) {
                console.error("❌ No CSRF Token found!");
                alert("❌ Error: No se encontró el token CSRF.");
                return;
            }

            try {
                const response = await fetch("/auth/register", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ Registro exitoso! Redirigiendo al login...");
                    window.location.href = "/auth/login";
                } else {
                    console.error("❌ Error en Registro:", data.errors || data.error || "Error desconocido.");
                    showRegisterErrors(data.errors, data.error);
                }
            } catch (error) {
                console.error("🚨 Error en el registro:", error);
                alert("❌ Hubo un error al conectar con el servidor.");
            }
        });
    }
});

function getCSRFTokenFromMeta() {
    return document.querySelector("meta[name='csrf-token']")?.content;
}

function showRegisterErrors(errors = {}, message = "") {
    const mapping = {
        nameError: { id: "name", error: errors.name },
        usernameError: { id: "username", error: errors.username },
        emailError: { id: "email", error: errors.email },
        phoneError: { id: "phone_number", error: errors.phone_number },
        addressError: { id: "address", error: errors.address },
        passwordError: { id: "password", error: errors.password },
        confirmPasswordError: { id: "confirm_password", error: errors.confirm_password }
    };

    let focused = false;

    for (const [errorId, { id: fieldId, error }] of Object.entries(mapping)) {
        const errorElement = document.getElementById(errorId);
        const inputElement = document.getElementById(fieldId);

        if (errorElement) {
            errorElement.innerText = error || "";
        }

        // Solo enfocamos el primer campo que tenga error
        if (error && inputElement && !focused) {
            inputElement.focus();
            focused = true;
        }
    }

    if (message) {
        alert("❌ " + message);
    }
}

function clearRegisterErrors() {
    const fields = [
        "nameError",
        "usernameError",
        "emailError",
        "phoneError",
        "addressError",
        "passwordError",
        "confirmPasswordError"
    ];

    for (const id of fields) {
        const el = document.getElementById(id);
        if (el) el.innerText = "";
    }
}
