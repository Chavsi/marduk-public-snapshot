//C:\web_project2\static\js\auth\password.js
document.addEventListener("DOMContentLoaded", () => {
    // 🔒 Reglas de validación de contraseña fuerte
    const criteria = {
        lenCheck: p => p.length >= 8,
        lowerCheck: p => /[a-z]/.test(p),
        upperCheck: p => /[A-Z]/.test(p),
        digitCheck: p => /[0-9]/.test(p),
        symbolCheck: p => /[!@#$%^&*(),.?":{}|<>]/.test(p)
    };

    // 🟢 Validación dinámica si existe algún campo con criterios visibles
    const passwordInput = document.querySelector("[data-password-check]");
    const criteriaContainer = document.getElementById("password-criteria");

    if (passwordInput && criteriaContainer) {
        passwordInput.addEventListener("input", () => {
            const val = passwordInput.value;
            for (const [id, check] of Object.entries(criteria)) {
                const el = document.getElementById(id);
                if (!el) continue;
                el.classList.toggle("valid", check(val));
                el.textContent = (check(val) ? "✅" : "❌") + " " + el.textContent.slice(2);
            }
        });
    }

    // 👁️ Mostrar/Ocultar para todos los botones
    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", () => {
            const wrapper = button.closest(".password-wrapper");
            if (!wrapper) return;

            const input = wrapper.querySelector(".password-input");
            const icon = button.querySelector(".eye-icon");

            if (!input || !icon) return;

            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";

            icon.src = isHidden
                ? "/static/icons/eye-closed-black.svg"
                : "/static/icons/eye-open-black.svg";
            icon.alt = isHidden ? "Ocultar" : "Mostrar";
        });
    });
});
