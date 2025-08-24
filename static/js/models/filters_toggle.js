document.addEventListener("DOMContentLoaded", function () {
const toggleBtn = document.getElementById("toggle-filters");
const filtersBar = document.querySelector(".filters-bar");

if (toggleBtn && filtersBar) {
    toggleBtn.addEventListener("click", () => {
    filtersBar.classList.toggle("hidden");
    });
}
});

