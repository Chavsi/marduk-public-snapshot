document.addEventListener("DOMContentLoaded", async function() {
    // Dropdown
    // --- Mobile hamburger only ---
    const mobileBtn  = document.querySelector("#mobile-menu-button");
    const mobileMenu = document.querySelector("#mobile-menu");

    if (mobileBtn && mobileMenu) {
    const closeMenu = () => {
        mobileMenu.classList.remove("open");
        mobileMenu.setAttribute("aria-hidden", "true");
        mobileBtn.setAttribute("aria-expanded", "false");
    };

    mobileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const opened = mobileMenu.classList.toggle("open");
        mobileMenu.setAttribute("aria-hidden", String(!opened));
        mobileBtn.setAttribute("aria-expanded", String(opened));
    });

    // Cerrar al hacer click fuera
    document.addEventListener("click", (e) => {
        if (!mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
        closeMenu();
        }
    });

    // Cerrar si el viewport ya no es mobile
    const mq = window.matchMedia("(max-width: 420px)");
    mq.addEventListener("change", (ev) => { if (!ev.matches) closeMenu(); });

    // Cerrar al navegar por un link del menú
    mobileMenu.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (a) closeMenu();
    });
    }
});
