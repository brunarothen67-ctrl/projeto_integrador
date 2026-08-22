/* =========================================================
   NAVBAR
   NAPNE - IFRS Campus Rolante
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const areaEntrar = document.getElementById("areaEntrar");
    const areaCadastro = document.getElementById("areaCadastro");
    const areaPerfil = document.getElementById("areaPerfil");
    const areaSair = document.getElementById("areaSair");

    const nomeUsuarioNavbar =
        document.getElementById("nomeUsuarioNavbar");

    const btnSairNavbar =
        document.getElementById("btnSairNavbar");


    // =====================================================
    // VERIFICAR SE OS ELEMENTOS EXISTEM
    // =====================================================

    if (
        !areaEntrar ||
        !areaCadastro ||
        !areaPerfil ||
        !areaSair
    ) {
        return;
    }


    // =====================================================
    // PEGAR USUÁRIO LOGADO
    // =====================================================

    let usuarioLogado = null;

    try {

        usuarioLogado =
            JSON.parse(
                localStorage.getItem("usuarioLogado")
            );

    } catch (erro) {

        usuarioLogado = null;

    }


    // =====================================================
    // NINGUÉM ESTÁ LOGADO
    // =====================================================

    if (!usuarioLogado) {

        areaEntrar.style.display = "";
        areaCadastro.style.display = "";

        areaPerfil.style.display = "none";
        areaSair.style.display = "none";

        return;
    }


    // =====================================================
    // USUÁRIO LOGADO
    // =====================================================

    areaEntrar.style.display = "none";
    areaCadastro.style.display = "none";

    areaPerfil.style.display = "flex";
    areaSair.style.display = "flex";


    // =====================================================
    // MOSTRAR NOME
    // =====================================================

    if (nomeUsuarioNavbar) {

        nomeUsuarioNavbar.textContent =
            usuarioLogado.nome || "Meu perfil";

    }


    // =====================================================
    // ADMINISTRADOR
    // =====================================================

    if (usuarioLogado.tipo === "admin") {

        areaPerfil.style.display = "none";

    }


    // =====================================================
    // BOTÃO SAIR
    // =====================================================

    if (btnSairNavbar) {

        btnSairNavbar.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                localStorage.removeItem(
                    "usuarioLogado"
                );

                window.location.href = "index.html";

            }
        );

    }

});