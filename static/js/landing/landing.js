document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('[data-animate-card]');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible-card');
                observer.unobserve(entry.target); // ✅ Para que no se repita
            }
        });
    }, { threshold: 0.8 });

    cards.forEach(card => observer.observe(card));
});



