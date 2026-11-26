/* =========================================================
   NAVBAR - PRIMEIRA PINTURA SEM "PULO"
   Roda no <head>, antes da página aparecer, e já deixa o menu
   no estado do último acesso (deslogado, usuário ou admin).
   A navbar.js confirma com o servidor logo em seguida.
   Isto é só uma dica visual: o acesso de verdade é validado no PHP.
========================================================= */

(function () {

    let estado = "deslogado";

    try {
        const guardado = JSON.parse(localStorage.getItem("napne_nav") || "null");

        if (guardado && ["usuario", "admin"].includes(guardado.estado)) {
            estado = guardado.estado;
        }
    } catch (e) { /* sem cache: segue como deslogado */ }

    document.documentElement.classList.add("nav-" + estado);

    const estilo = document.createElement("style");

    estilo.textContent = `
        html.nav-usuario #areaEntrar, html.nav-usuario #areaCadastro,
        html.nav-admin #areaEntrar, html.nav-admin #areaCadastro,
        html.nav-admin #areaPerfil,
        html.nav-deslogado #areaPerfil, html.nav-deslogado #areaSair { display: none !important; }

        html.nav-usuario #areaPerfil, html.nav-usuario #areaSair,
        html.nav-admin #areaSair { display: flex !important; }
    `;

    document.head.appendChild(estilo);

})();
