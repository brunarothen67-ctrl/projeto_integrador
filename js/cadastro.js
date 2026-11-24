/* =========================================================
   CADASTRO DE USUÁRIO
   NAPNE - IFRS Campus Rolante
========================================================= */

const formulario = document.getElementById("formCadastro");

if (formulario) {

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (!nome || !email || !senha || !confirmarSenha) {
            alert("Preencha todos os campos.");
            return;
        }

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem.");
            return;
        }

        try {

            const resposta = await fetch("api/cadastro.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro || "Não foi possível realizar o cadastro.");
                return;
            }

            alert(dados.mensagem);

            window.location.href = "login.html";

        } catch (erro) {

            console.error("Erro no cadastro:", erro);
            alert("Não foi possível conectar ao servidor. Tente novamente.");

        }

    });

}
