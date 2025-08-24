// back-button.js
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".back-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const fallback = btn.getAttribute("data-back") || "/";
      const referrer = document.referrer;
      if (referrer && referrer !== window.location.href) {
        window.history.back();
      } else {
        window.location.href = fallback;
      }
    });
  });
});
