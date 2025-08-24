// js/sidebar.js (sin module)
//console.log("✅ sidebar.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Manejo del toggle por sección (ya existente)
  document.querySelectorAll(".sidebar-section-header").forEach(header => {
    const container = header.closest(".sidebar-section");
    const sectionId = container.dataset.section;
    const menu = container.querySelector("ul.sidebar-menu");
    const toggleIcon = header.querySelector(".sidebar-toggle");

    // Cargar estado guardado
    const expanded = localStorage.getItem("sidebar:" + sectionId) === "true";
    if (expanded) {
      menu.classList.remove("hidden");
      if (toggleIcon) toggleIcon.textContent = "▼";
    }

    // Toggle al hacer clic
    header.addEventListener("click", () => {
      const isHidden = menu.classList.toggle("hidden");
      localStorage.setItem("sidebar:" + sectionId, !isHidden);
      if (toggleIcon) toggleIcon.textContent = isHidden ? "▶" : "▼";
    });
  });

  // ✅ Nuevo: toggle global del sidebar (hamburguesa)
  const sidebarToggleBtn = document.getElementById("sidebar-toggle");
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-collapsed");

      const isCollapsed = document.body.classList.contains("sidebar-collapsed");
      sidebarToggleBtn.textContent = isCollapsed ? "▶" : "◀";
      localStorage.setItem("sidebar:collapsed", isCollapsed);

      // ✅ Forzar evento de resize para que Tabulator se ajuste
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    });

    // Restaurar estado guardado al cargar
    const wasCollapsed = localStorage.getItem("sidebar:collapsed") === "true";
    if (wasCollapsed) {
      document.body.classList.add("sidebar-collapsed");
      sidebarToggleBtn.textContent = "▶";
    } else {
      sidebarToggleBtn.textContent = "◀";
    }
  }
});

