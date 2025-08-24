document.addEventListener("DOMContentLoaded", () => {
  const cleanupBtn = document.getElementById("cleanup-tokens-btn");
  const testMailBtn = document.getElementById("test-mail-btn");
  const feedback = document.getElementById("feedback");

  if (cleanupBtn) {
    cleanupBtn.addEventListener("click", async () => {
      if (!confirm("¿Eliminar tokens expirados?")) return;

      const res = await fetch("/admin/mail/cleanup-expired-reset-tokens");
      const json = await res.json();
      feedback.textContent = json.message || json.error || "❓";
    });
  }

  if (testMailBtn) {
    testMailBtn.addEventListener("click", async () => {
      const res = await fetch("/admin/mail/test-mail");
      const text = await res.text();
      feedback.textContent = text;
    });
  }
});
