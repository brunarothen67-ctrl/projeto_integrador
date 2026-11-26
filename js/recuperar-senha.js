const formulario = document.getElementById("formRecuperacao");
const mensagem = document.getElementById("mensagemRecuperacao");

formulario.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const botao = formulario.querySelector("button[type=submit]");

    botao.disabled = true;

    try {

        const resposta = await fetch("/api/recuperar-senha.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || "Não foi possível enviar a solicitação.");
            return;
        }

        mensagem.classList.remove("d-none");
        formulario.reset();

    } catch (erro) {

        console.error("Erro na recuperação de senha:", erro);
        alert("Não foi possível conectar ao servidor. Tente novamente.");

    } finally {

        botao.disabled = false;

    }

});
