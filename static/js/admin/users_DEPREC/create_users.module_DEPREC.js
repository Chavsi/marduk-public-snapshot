console.log("✅ Register JS Loaded!");

document.addEventListener("DOMContentLoaded", async function () {
    await loadRolesToDropdown(); // 🟢 Carga dinámica de roles al iniciar

    const registerForm = document.querySelector("#CreateUsersForm");
    const submitBtn = registerForm.querySelector("button[type='submit']");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            console.log("📌 Create form submitted!");

            clearRegisterErrors();

            const formData = {
                name: document.querySelector("#name")?.value.trim() || "",
                username: document.querySelector("#create_username")?.value.trim() || "",
                role: document.querySelector("#role")?.value.trim().toLowerCase() || "",
                email: document.querySelector("#email")?.value.trim() || "",
                phone_number: document.querySelector("#phone_number")?.value.trim() || null,
                address: document.querySelector("#address")?.value.trim() || null,
                password: document.querySelector("#admin_create_password")?.value.trim() || "",
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
                submitBtn.disabled = true;

                const response = await fetch("/admin/users/create-users", {
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
                    alert("✅ Usuario creado exitosamente.");
                    document.getElementById("userModal").classList.add("hidden");
                    registerForm.reset();
                
                    if (window.userTable && data.user) {
                        window.userTable.addRow(data.user);
                    }

                } else {
                    console.error("❌ Error en Registro:", data.errors || data.error || "Error desconocido.");
                    showRegisterErrors(data.errors, data.error);
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error("🚨 Error en el registro:", error);
                alert("❌ Hubo un error al conectar con el servidor.");
            } finally {
                submitBtn.disabled = false;
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
        usernameError: { id: "create_username", error: errors.username },
        roleError: { id: "role", error: errors.role },
        emailError: { id: "email", error: errors.email },
        phoneError: { id: "phone_number", error: errors.phone_number },
        addressError: { id: "address", error: errors.address },
        passwordError: { id: "admin_create_password", error: errors.password },
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
        "roleError",
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

async function loadRolesToDropdown() {
    console.log("🔄 Cargando roles dinámicos...");
    const select = document.querySelector("#role");
    if (!select) return;

    try {
        const response = await fetch("/admin/roles/api/roles");
        const roles = await response.json();

        // Limpiar opciones existentes
        select.innerHTML = "";

        // Agregar opciones dinámicas
        roles.forEach(role => {
            const option = document.createElement("option");
            option.value = role.value;
            option.innerText = `${role.icon || "🔧"} ${role.role_label}`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("❌ No se pudieron cargar los roles dinámicamente:", err);
        alert("⚠️ Error al cargar roles. Recarga la página o contacta al soporte.");
        select.innerHTML = `<option disabled selected>⚠️ No hay roles disponibles</option>`;
    }
}
