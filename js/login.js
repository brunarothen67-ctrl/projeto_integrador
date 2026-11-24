/* =========================================================
   LOGIN DE USUÁRIO
   NAPNE - IFRS Campus Rolante
========================================================= */

const formulario = document.getElementById("formLogin");

if (formulario) {

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;

        if (!email || !senha) {
            alert("Preencha o e-mail e a senha.");
            return;
        }

        try {

            const resposta = await fetch("/api/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok || !dados.sucesso) {
                alert(dados.erro || "E-mail ou senha inválidos.");
                return;
            }

            const usuario = dados.usuario;

            if (usuario.tipo === "admin") {
                window.location.href = "/admin/painel-admin.html";
                return;
            }

            const voltarDepoisLogin = localStorage.getItem("voltarDepoisLogin");

            if (voltarDepoisLogin) {
                localStorage.removeItem("voltarDepoisLogin");
                window.location.href = voltarDepoisLogin;
            } else {
                window.location.href = "/index.html";
            }

        } catch (erro) {

            console.error("Erro no login:", erro);
            alert("Não foi possível conectar ao servidor. Tente novamente.");

        }

    });

}
