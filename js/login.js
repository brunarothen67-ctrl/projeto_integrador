
/* =========================================================
   LOGIN DE USUÁRIO
   NAPNE - IFRS Campus Rolante
========================================================= */

const formulario = document.getElementById("formLogin");

if (formulario) {

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        // ==========================
        // PEGAR DADOS
        // ==========================

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const senha = document
            .getElementById("senha")
            .value;


        // ==========================
        // LOGIN ADMINISTRADOR
        // ==========================

        if (
            email === "admin@napne.com" &&
            senha === "123456"
        ) {

            const administrador = {
                nome: "Administrador",
                email: email,
                tipo: "admin"
            };

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(administrador)
            );

            window.location.href = "./admin/painel-admin.html";

            return;
        }


        // ==========================
        // BUSCAR USUÁRIOS
        // ==========================

        const usuarios =
            JSON.parse(
                localStorage.getItem("usuarios")
            ) || [];


        // ==========================
        // PROCURAR USUÁRIO
        // ==========================

        const usuario = usuarios.find(function (usuario) {

            return (
                usuario.email === email &&
                usuario.senha === senha
            );

        });


        // ==========================
        // LOGIN VÁLIDO
        // ==========================

        if (usuario) {

          const usuarioLogado = {
             nome: usuario.nome,
            email: usuario.email,
            tipo: "usuario",
            foto: usuario.foto || ""
        };

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuarioLogado)
            );


            // ==========================
            // VOLTAR PARA A PÁGINA ANTERIOR
            // ==========================

            const voltarDepoisLogin =
                localStorage.getItem("voltarDepoisLogin");


            if (voltarDepoisLogin) {

                localStorage.removeItem(
                    "voltarDepoisLogin"
                );

                window.location.href =
                    voltarDepoisLogin;

            } else {

                window.location.href =
                    "index.html";

            }

            return;
        }


        // ==========================
        // LOGIN INVÁLIDO
        // ==========================

        alert(
            "E-mail ou senha inválidos."
        );

    });

}
