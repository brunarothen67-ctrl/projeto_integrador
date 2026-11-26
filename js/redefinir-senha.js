document.addEventListener("DOMContentLoaded", async function () {

    const token = new URLSearchParams(window.location.search).get("token") || "";

    const carregando = document.getElementById("textoCarregando");
    const invalido = document.getElementById("linkInvalido");
    const formulario = document.getElementById("formRedefinir");
    const sucesso = document.getElementById("sucesso");

    // Tira o token da barra de endereços (não fica no histórico nem em capturas)
    history.replaceState(null, "", window.location.pathname);

    let valido = false;

    try {

        const resposta = await fetch("/api/redefinir-senha.php?token=" + encodeURIComponent(token));
        valido = resposta.ok;

    } catch (erro) {

        console.error("Erro ao validar o link:", erro);

    }

    carregando.classList.add("d-none");

    if (!valido) {
        invalido.classList.remove("d-none");
        return;
    }

    formulario.classList.remove("d-none");

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const senha = document.getElementById("novaSenha").value;
        const confirmar = document.getElementById("confirmarSenha").value;

        if (senha !== confirmar) {
            alert("As senhas não coincidem.");
            return;
        }

        try {

            const resposta = await fetch("/api/redefinir-senha.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro || "Não foi possível redefinir a senha.");
                return;
            }

            formulario.classList.add("d-none");
            sucesso.classList.remove("d-none");

        } catch (erro) {

            console.error("Erro ao redefinir senha:", erro);
            alert("Não foi possível conectar ao servidor.");

        }

    });

});
