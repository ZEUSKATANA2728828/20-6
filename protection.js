/* protection.js */
/* Proteção contra inspeção, DevTools, copiar código, etc. */

(function(){

  // Bloqueia botão direito
  document.addEventListener("contextmenu", e => e.preventDefault());

  // Bloqueia teclas de atalho
  document.addEventListener("keydown", e => {
    // F12
    if(e.key === "F12") e.preventDefault();

    // Ctrl+Shift+I / J / C
    if(e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase()))
      e.preventDefault();

    // Ctrl+U
    if(e.ctrlKey && e.key.toUpperCase() === "U")
      e.preventDefault();
  });

  // Anti-DevTools (não é perfeito, mas ajuda)
  function detectDevTools() {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      alert("Desative as ferramentas de desenvolvedor para continuar.");
      window.location.href = "about:blank";
    }
  }

  setInterval(detectDevTools, 800);

})();
