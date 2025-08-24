document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("note-display");
  const textarea = document.getElementById("note-edit");
  const editBtn = document.getElementById("edit-note-btn");
  const saveBtn = document.getElementById("save-note-btn");
  const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

  editBtn.addEventListener("click", () => {
    display.classList.add("hidden");
    textarea.classList.remove("hidden");
    editBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
  });

  saveBtn.addEventListener("click", async () => {
    const note = textarea.value;

    try {
      const response = await fetch("/company/patch-note", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ note })
      });

      const result = await response.json();
      if (result.success) {
        display.textContent = result.updated_note || "---";
        display.classList.remove("hidden");
        textarea.classList.add("hidden");
        editBtn.classList.remove("hidden");
        saveBtn.classList.add("hidden");
      } else {
        alert(result.error || "❌ No se pudo actualizar la nota.");
      }
    } catch (err) {
      console.error("Error actualizando la nota:", err);
      alert("⚠️ Error de conexión al actualizar.");
    }
  });
});
