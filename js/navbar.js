/* =========================================================
   NAVBAR
   NAPNE - IFRS Campus Rolante
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const areaEntrar = document.getElementById("areaEntrar");
    const areaCadastro = document.getElementById("areaCadastro");
    const areaPerfil = document.getElementById("areaPerfil");
    const areaSair = document.getElementById("areaSair");

    const nomeUsuarioNavbar = document.getElementById("nomeUsuarioNavbar");
    const btnSairNavbar = document.getElementById("btnSairNavbar");

    if (!areaEntrar || !areaCadastro || !areaPerfil || !areaSair) {
        return;
    }

    function mostrarDeslogado() {
        areaEntrar.style.display = "";
        areaCadastro.style.display = "";
        areaPerfil.style.display = "none";
        areaSair.style.display = "none";
    }

    try {
        const resposta = await fetch("/api/sessao.php", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            mostrarDeslogado();
            return;
        }

        const dados = await resposta.json();

        if (!dados.autenticado || !dados.usuario) {
            mostrarDeslogado();
            return;
        }

        const usuario = dados.usuario;

        areaEntrar.style.display = "none";
        areaCadastro.style.display = "none";
        areaPerfil.style.display = "flex";
        areaSair.style.display = "flex";

        if (nomeUsuarioNavbar) {
            nomeUsuarioNavbar.textContent = usuario.nome || "Meu perfil";
        }

        if (usuario.tipo === "admin") {
            areaPerfil.style.display = "none";
        }

    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
        mostrarDeslogado();
    }

    if (btnSairNavbar) {
        btnSairNavbar.addEventListener("click", async function (event) {
            event.preventDefault();

            try {
                await fetch("/api/logout.php", {
                    method: "POST",
                    credentials: "same-origin"
                });

                window.location.href = "/index.html";

            } catch (erro) {
                console.error("Erro ao sair:", erro);
                alert("Não foi possível encerrar a sessão.");
            }
        });
    }

});
