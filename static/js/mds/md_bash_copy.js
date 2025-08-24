document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("pre > code").forEach(codeBlock => {
    const button = document.createElement("button");
    button.className = "copy-button";
    button.textContent = "📋 Copiar";

    button.addEventListener("click", () => {
      const text = codeBlock.innerText;
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = "✅ Copiado";
        setTimeout(() => button.textContent = "📋 Copiar", 2000);
      });
    });

    const pre = codeBlock.parentNode;
    pre.style.position = "relative";
    button.style.position = "absolute";
    button.style.top = "5px";
    button.style.right = "5px";
    button.style.padding = "2px 6px";
    button.style.fontSize = "0.8rem";

    pre.appendChild(button);
  });
});

