/* =========================================================
   CONTEÚDOS DO SITE (projetos, eventos e materiais)
   Substitui o antigo localStorage: os dados ficam no banco
   e são lidos/gravados pela API /api/conteudos.php
========================================================= */

window.NapneConteudos = (function () {

    const cache = {};

    function urlApi() {

        // Funciona tanto nas páginas da raiz quanto em /admin e /materiais
        return new URL("/api/conteudos.php", window.location.origin).toString();

    }

    async function carregar(tipo) {

        try {

            const resposta = await fetch(urlApi() + "?tipo=" + encodeURIComponent(tipo), {
                credentials: "same-origin"
            });

            if (!resposta.ok) {
                throw new Error("Falha ao consultar " + tipo);
            }

            const dados = await resposta.json();
            cache[tipo] = Array.isArray(dados) ? dados : [];

        } catch (erro) {

            console.error("Erro ao carregar " + tipo + ":", erro);
            cache[tipo] = [];

        }

        return cache[tipo];

    }

    function obter(tipo) {

        return cache[tipo] || [];

    }

    // Atualiza a cópia local na hora e grava no banco em seguida
    async function salvar(tipo, itens) {

        cache[tipo] = itens;

        try {

            const resposta = await fetch(urlApi(), {
                method: "PUT",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: tipo, itens: itens })
            });

            const dados = await resposta.json().catch(function () { return {}; });

            if (!resposta.ok) {

                if (resposta.status === 401 || resposta.status === 403) {
                    alert("Sua sessão expirou. Entre novamente como administrador.");
                    window.location.href = "/login.html";
                    return false;
                }

                alert(dados.erro || "Não foi possível salvar as alterações.");
                return false;

            }

            return true;

        } catch (erro) {

            console.error("Erro ao salvar " + tipo + ":", erro);
            alert("Não foi possível conectar ao servidor. As alterações não foram salvas.");
            return false;

        }

    }

    return { carregar: carregar, obter: obter, salvar: salvar };

})();

// Sair do painel administrativo (encerra a sessão no servidor)
window.sairDoSistema = async function (destino) {

    try { localStorage.removeItem("napne_nav"); } catch (e) { /* ignora */ }

    try {

        await fetch("/api/logout.php", { method: "POST", credentials: "same-origin" });

    } catch (erro) {

        console.error("Erro ao sair:", erro);

    }

    window.location.href = destino || "/index.html";

};
