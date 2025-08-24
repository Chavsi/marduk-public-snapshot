document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("change-password-form");
    if (!form) return;

    const messageContainer = document.getElementById("flash-messages");
    const changePasswordUrl = form.getAttribute("data-action");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const old_password = document.getElementById("old_password").value.trim();
        const new_password = document.getElementById("new_password").value.trim();
        const confirm_password = document.getElementById("confirm_password").value.trim();
        const csrf_token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

        messageContainer.innerHTML = `<p style="color: #444;">⏳ Procesando, por favor espera...</p>`;

        try {
            const response = await fetch(changePasswordUrl, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrf_token,
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: JSON.stringify({
                    old_password,
                    new_password,
                    confirm_password
                })
            });

            const data = await response.json();
            messageContainer.innerHTML = "";

            if (data.success || data.message) {
                messageContainer.innerHTML = `<p style="color: green;">✅ ${data.message || "Contraseña cambiada correctamente."}</p>`;
                form.reset();
            } else if (data.errors) {
                Object.values(data.errors).forEach(error => {
                    const p = document.createElement("p");
                    p.style.color = "red";
                    p.textContent = error;
                    messageContainer.appendChild(p);
                });
            } else if (data.error) {
                messageContainer.innerHTML = `<p style="color: red;">❌ ${data.error}</p>`;
            }

        } catch (err) {
            console.error("🚨 Error en solicitud:", err);
            messageContainer.innerHTML = `<p style="color: red;">❌ Error al enviar datos.</p>`;
        }
    });
});

