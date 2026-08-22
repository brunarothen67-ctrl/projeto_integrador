
/* =========================================================
   CADASTRO DE USUÁRIO
   NAPNE - IFRS Campus Rolante
========================================================= */

// Pega o formulário de cadastro
const formulario = document.getElementById("formCadastro");


// Verifica se o formulário existe na página
if (formulario) {

    formulario.addEventListener("submit", function (event) {

        // Impede o formulário de recarregar a página
        event.preventDefault();


        // ==========================
        // PEGAR OS DADOS
        // ==========================

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;


        // ==========================
        // VERIFICAR CAMPOS
        // ==========================

        if (!nome || !email || !senha || !confirmarSenha) {

            alert("Preencha todos os campos.");

            return;
        }


        // ==========================
        // VERIFICAR SENHAS
        // ==========================

        if (senha !== confirmarSenha) {

            alert("As senhas não coincidem.");

            return;
        }


        // ==========================
        // BUSCAR USUÁRIOS SALVOS
        // ==========================

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];


        // ==========================
        // VERIFICAR SE E-MAIL JÁ EXISTE
        // ==========================

        const usuarioExistente = usuarios.find(function (usuario) {

            return usuario.email === email;

        });


        if (usuarioExistente) {

            alert("Este e-mail já está cadastrado.");

            return;
        }


        // ==========================
        // CRIAR NOVO USUÁRIO
        // ==========================
        const novoUsuario = {
        nome: nome,
        email: email,
        senha: senha,
        tipo: "usuario",
        foto: ""
        };


        // ==========================
        // SALVAR USUÁRIO
        // ==========================

        usuarios.push(novoUsuario);

        localStorage.setItem("usuarios", JSON.stringify(usuarios));


        // ==========================
        // MENSAGEM DE SUCESSO
        // ==========================

        alert("Cadastro realizado com sucesso!");


        // ==========================
        // IR PARA LOGIN
        // ==========================

        window.location.href = "login.html";

    });

}

