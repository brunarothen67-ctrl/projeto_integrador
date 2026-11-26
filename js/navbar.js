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

    // Nome do último acesso já na primeira pintura (evita o menu "mudar de largura")
    try {
        const guardado = JSON.parse(localStorage.getItem("napne_nav") || "null");

        if (guardado && guardado.nome && nomeUsuarioNavbar) {
            nomeUsuarioNavbar.textContent = guardado.nome;
        }
    } catch (e) { /* ignora */ }

    // Guarda o estado confirmado pelo servidor para a próxima página já abrir certa
    function registrarEstado(estado, nome) {
        document.documentElement.classList.remove("nav-deslogado", "nav-usuario", "nav-admin");
        document.documentElement.classList.add("nav-" + estado);

        try {
            localStorage.setItem("napne_nav", JSON.stringify({ estado: estado, nome: nome || "" }));
        } catch (e) { /* ignora */ }
    }

    function mostrarDeslogado() {
        registrarEstado("deslogado");
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

        registrarEstado(usuario.tipo === "admin" ? "admin" : "usuario", usuario.nome);

    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
        mostrarDeslogado();
    }

    if (btnSairNavbar) {
        btnSairNavbar.addEventListener("click", async function (event) {
            event.preventDefault();
            registrarEstado("deslogado");

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
