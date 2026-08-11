```javascript
/* =========================================================
   CADASTRO DE USUÁRIO
   NAPNE - IFRS Campus Rolante

   Sistema apenas front-end.
   Os dados são armazenados no localStorage
   do navegador para simular um cadastro.
========================================================= */


const formulario = document.getElementById("formCadastro");


formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    /* =====================================================
       PEGAR DADOS DO FORMULÁRIO
    ===================================================== */

    const nome = document
        .getElementById("nome")
        .value
        .trim();

    const email = document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const senha = document
        .getElementById("senha")
        .value;

    const confirmarSenha = document
        .getElementById("confirmarSenha")
        .value;


    /* =====================================================
       VERIFICAR SENHAS
    ===================================================== */

    if (senha !== confirmarSenha) {

        alert("As senhas não coincidem.");

        return;
    }


    /* =====================================================
       VERIFICAR SENHA VAZIA
    ===================================================== */

    if (senha.length < 6) {

        alert("A senha deve ter pelo menos 6 caracteres.");

        return;
    }


    /* =====================================================
       VERIFICAR SE É O E-MAIL DO ADMINISTRADOR
    ===================================================== */

    if (email === "admin@napne.com") {

        alert(
            "Este e-mail é reservado para o administrador."
        );

        return;
    }


    /* =====================================================
       CRIAR USUÁRIO
    ===================================================== */

    const usuario = {

        nome: nome,

        email: email,

        senha: senha

    };


    /* =====================================================
       SALVAR USUÁRIO NO NAVEGADOR
    ===================================================== */

    localStorage.setItem(
        "usuarioNAPNE",
        JSON.stringify(usuario)
    );


    /* =====================================================
       MARCAR COMO LOGADO
    ===================================================== */

    localStorage.setItem(
        "usuarioLogado",
        "true"
    );


    localStorage.setItem(
        "nomeUsuario",
        nome
    );


    /* =====================================================
       MENSAGEM
    ===================================================== */

    alert(
        "Cadastro realizado com sucesso!"
    );


    /* =====================================================
       IR PARA A HOME
    ===================================================== */

    window.location.href = "index.html";

});
```
