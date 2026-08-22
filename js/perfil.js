
/* =========================================================
   PERFIL DO USUÁRIO
   NAPNE - IFRS Campus Rolante
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // VERIFICAR SE EXISTE USUÁRIO LOGADO
    // ==========================================

    const usuarioLogado =
        JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {

        alert("Você precisa estar logado para acessar seu perfil.");

        window.location.href = "login.html";

        return;
    }


    // ==========================================
    // PEGAR ELEMENTOS DA PÁGINA
    // ==========================================

    const nomePerfil = document.getElementById("nomePerfil");
    const emailPerfil = document.getElementById("emailPerfil");
    const fotoPerfil = document.getElementById("fotoPerfil");
    const fotoInput = document.getElementById("fotoInput");
    const formPerfil = document.getElementById("formPerfil");
    const nomeNavbar = document.getElementById("nomeNavbar");
    const btnSair = document.getElementById("btnSair");


    // ==========================================
    // CARREGAR DADOS DO USUÁRIO
    // ==========================================

    nomePerfil.value = usuarioLogado.nome || "";
    emailPerfil.value = usuarioLogado.email || "";

    if (nomeNavbar) {
        nomeNavbar.textContent = usuarioLogado.nome || "Meu perfil";
    }


    // ==========================================
    // CARREGAR FOTO DE PERFIL
    // ==========================================

    if (usuarioLogado.foto) {

        fotoPerfil.src = usuarioLogado.foto;

    } else {

        fotoPerfil.src = "imagens/avatar.png";
    }


    // ==========================================
    // ALTERAR FOTO
    // ==========================================

    if (fotoInput) {

        fotoInput.addEventListener("change", function () {

            const arquivo = fotoInput.files[0];

            if (!arquivo) {
                return;
            }


            // Verifica se é imagem
            if (!arquivo.type.startsWith("image/")) {

                alert("Escolha uma imagem válida.");

                fotoInput.value = "";

                return;
            }


            // Limita o tamanho
            if (arquivo.size > 2 * 1024 * 1024) {

                alert("A imagem deve ter no máximo 2 MB.");

                fotoInput.value = "";

                return;
            }


            const leitor = new FileReader();


            leitor.onload = function (event) {

                const fotoBase64 = event.target.result;

                // Mostra a foto imediatamente
                fotoPerfil.src = fotoBase64;

                // Guarda a foto no usuário logado
                usuarioLogado.foto = fotoBase64;

                salvarUsuario(usuarioLogado);

                alert("Foto de perfil atualizada com sucesso!");
            };


            leitor.readAsDataURL(arquivo);

        });

    }


    // ==========================================
    // SALVAR ALTERAÇÕES
    // ==========================================

    if (formPerfil) {

        formPerfil.addEventListener("submit", function (event) {

            event.preventDefault();


            const novoNome =
                nomePerfil.value.trim();

            const novoEmail =
                emailPerfil.value.trim().toLowerCase();

            const novaSenha =
                document.getElementById("novaSenha").value;

            const confirmarNovaSenha =
                document.getElementById("confirmarNovaSenha").value;


            // ==================================
            // VALIDAR NOME E E-MAIL
            // ==================================

            if (!novoNome || !novoEmail) {

                alert("Preencha o nome e o e-mail.");

                return;
            }


            // ==================================
            // VERIFICAR NOVA SENHA
            // ==================================

            if (novaSenha || confirmarNovaSenha) {

                if (novaSenha !== confirmarNovaSenha) {

                    alert("As novas senhas não coincidem.");

                    return;
                }

                if (novaSenha.length < 6) {

                    alert("A nova senha deve ter pelo menos 6 caracteres.");

                    return;
                }
            }


            // ==================================
            // BUSCAR USUÁRIOS
            // ==================================

            let usuarios =
                JSON.parse(localStorage.getItem("usuarios")) || [];


            // ==================================
            // VERIFICAR E-MAIL DUPLICADO
            // ==================================

            const emailExistente = usuarios.find(function (usuario) {

                return (
                    usuario.email === novoEmail &&
                    usuario.email !== usuarioLogado.email
                );

            });


            if (emailExistente) {

                alert("Este e-mail já está cadastrado.");

                return;
            }


            // ==================================
            // LOCALIZAR USUÁRIO
            // ==================================

            const indiceUsuario = usuarios.findIndex(function (usuario) {

                return usuario.email === usuarioLogado.email;

            });


            if (indiceUsuario === -1) {

                alert("Usuário não encontrado.");

                return;
            }


            // ==================================
            // ATUALIZAR USUÁRIO
            // ==================================

            usuarios[indiceUsuario].nome = novoNome;
            usuarios[indiceUsuario].email = novoEmail;


            if (novaSenha) {

                usuarios[indiceUsuario].senha = novaSenha;
            }


            // Mantém a foto
            if (usuarioLogado.foto) {

                usuarios[indiceUsuario].foto =
                    usuarioLogado.foto;
            }


            // ==================================
            // SALVAR USUÁRIOS
            // ==================================

            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );


            // ==================================
            // ATUALIZAR USUÁRIO LOGADO
            // ==================================

            usuarioLogado.nome = novoNome;
            usuarioLogado.email = novoEmail;


            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuarioLogado)
            );


            // ==================================
            // ATUALIZAR NAVBAR
            // ==================================

            if (nomeNavbar) {

                nomeNavbar.textContent = novoNome;
            }


            // ==================================
            // LIMPAR SENHAS
            // ==================================

            document.getElementById("novaSenha").value = "";
            document.getElementById("confirmarNovaSenha").value = "";


            alert("Dados atualizados com sucesso!");

        });

    }


    // ==========================================
    // BOTÃO SAIR
    // ==========================================

    if (btnSair) {

        btnSair.addEventListener("click", function () {

            const confirmar =
                confirm("Deseja realmente sair da sua conta?");

            if (!confirmar) {
                return;
            }


            localStorage.removeItem("usuarioLogado");

            window.location.href = "index.html";

        });

    }

});


// =================================================
// FUNÇÃO PARA SALVAR USUÁRIO
// =================================================

function salvarUsuario(usuarioAtualizado) {

    let usuarios =
        JSON.parse(localStorage.getItem("usuarios")) || [];


    const indice = usuarios.findIndex(function (usuario) {

        return usuario.email === usuarioAtualizado.email;

    });


    if (indice !== -1) {

        usuarios[indice] = usuarioAtualizado;

    }


    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );


    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuarioAtualizado)
    );
}

