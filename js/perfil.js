/* =========================================================
   PERFIL DO USUÁRIO
   NAPNE - IFRS Campus Rolante
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const nomePerfil = document.getElementById("nomePerfil");
    const emailPerfil = document.getElementById("emailPerfil");
    const fotoPerfil = document.getElementById("fotoPerfil");
    const fotoInput = document.getElementById("fotoInput");
    const formPerfil = document.getElementById("formPerfil");
    const nomeNavbar = document.getElementById("nomeNavbar");
    const btnSair = document.getElementById("btnSair");

    const novaSenha = document.getElementById("novaSenha");
    const confirmarNovaSenha = document.getElementById("confirmarNovaSenha");

    // Verificar sessão e carregar dados
    try {

        const resposta = await fetch("/api/perfil.php", {
            credentials: "same-origin"
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            alert("Você precisa estar logado para acessar seu perfil.");
            window.location.href = "/login.html";
            return;
        }

        nomePerfil.value = dados.usuario.nome || "";
        emailPerfil.value = dados.usuario.email || "";

        if (nomeNavbar) {
            nomeNavbar.textContent = dados.usuario.nome || "Meu perfil";
        }

        // Carregar foto salva no servidor
        if (fotoPerfil && dados.usuario.foto_perfil) {
            fotoPerfil.src = "/" + dados.usuario.foto_perfil + "?t=" + Date.now();
        }

    } catch (erro) {

        console.error("Erro ao carregar perfil:", erro);
        alert("Não foi possível carregar seus dados.");
        return;
    }

    // Alterar e salvar foto permanentemente
    if (fotoInput && fotoPerfil) {

        fotoInput.addEventListener("change", async function () {

            const arquivo = fotoInput.files[0];

            if (!arquivo) return;

            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!tiposPermitidos.includes(arquivo.type)) {
                alert("Escolha uma imagem JPG, PNG ou WebP.");
                fotoInput.value = "";
                return;
            }

            if (arquivo.size > 2 * 1024 * 1024) {
                alert("A imagem deve ter no máximo 2 MB.");
                fotoInput.value = "";
                return;
            }

            const fotoAnterior = fotoPerfil.src;

            // Pré-visualização da imagem
            const leitor = new FileReader();

            leitor.onload = function (event) {
                fotoPerfil.src = event.target.result;
            };

            leitor.readAsDataURL(arquivo);

            // Preparar envio ao servidor
            const formulario = new FormData();
            formulario.append("foto", arquivo);

            try {

                const resposta = await fetch("/api/perfil.php", {
                    method: "POST",
                    credentials: "same-origin",
                    body: formulario
                });

                const dados = await resposta.json();

                if (!resposta.ok || !dados.sucesso) {
                    fotoPerfil.src = fotoAnterior;
                    alert(dados.erro || "Não foi possível salvar a foto.");
                    return;
                }

                // Mostrar imagem salva no servidor
                fotoPerfil.src = "/" + dados.foto_perfil + "?t=" + Date.now();

                alert(dados.mensagem || "Foto atualizada com sucesso!");

            } catch (erro) {

                console.error("Erro ao enviar foto:", erro);
                fotoPerfil.src = fotoAnterior;
                alert("Não foi possível conectar ao servidor.");

            } finally {
                fotoInput.value = "";
            }
        });
    }

    // Salvar alterações do perfil
    if (formPerfil) {

        formPerfil.addEventListener("submit", async function (event) {

            event.preventDefault();

            const nome = nomePerfil.value.trim();
            const email = emailPerfil.value.trim().toLowerCase();
            const senha = novaSenha.value;
            const confirmarSenha = confirmarNovaSenha.value;

            if (!nome || !email) {
                alert("Preencha o nome e o e-mail.");
                return;
            }

            if (senha || confirmarSenha) {

                if (senha !== confirmarSenha) {
                    alert("As novas senhas não coincidem.");
                    return;
                }

                if (senha.length < 6) {
                    alert("A nova senha deve ter pelo menos 6 caracteres.");
                    return;
                }
            }

            try {

                const resposta = await fetch("/api/perfil.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        nome: nome,
                        email: email,
                        novaSenha: senha
                    })
                });

                const dados = await resposta.json();

                if (!resposta.ok || !dados.sucesso) {
                    alert(dados.erro || "Não foi possível atualizar o perfil.");
                    return;
                }

                if (nomeNavbar) {
                    nomeNavbar.textContent = nome;
                }

                novaSenha.value = "";
                confirmarNovaSenha.value = "";

                alert(dados.mensagem || "Perfil atualizado com sucesso!");

            } catch (erro) {

                console.error("Erro ao atualizar perfil:", erro);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }

    // Sair da conta
    if (btnSair) {

        btnSair.addEventListener("click", async function () {

            const confirmar = confirm("Deseja realmente sair da sua conta?");
            try { localStorage.removeItem("napne_nav"); } catch (e) { /* ignora */ }

            if (!confirmar) return;

            try {

                const resposta = await fetch("/api/logout.php", {
                    method: "POST",
                    credentials: "same-origin"
                });

                if (!resposta.ok) {
                    alert("Não foi possível encerrar a sessão.");
                    return;
                }

                window.location.href = "/index.html";

            } catch (erro) {

                console.error("Erro ao sair:", erro);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }

});
