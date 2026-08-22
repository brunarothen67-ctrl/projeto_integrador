/* =========================================================
   RELATOS
   NAPNE - IFRS Campus Rolante
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("RELATOS.JS FUNCIONOU!");

    const botao = document.getElementById("btnCriarPublicacao");
    const modalAcessoElemento = document.getElementById("modalAcesso");
    const modalRelatoElemento = document.getElementById("modalRelato");
    const formulario = document.getElementById("formRelato");


    // =====================================================
    // VERIFICAR USUÁRIO LOGADO
    // =====================================================

    function obterUsuarioLogado() {

        const dadosLogin =
            localStorage.getItem("usuarioLogado");

        if (!dadosLogin) {
            return null;
        }

        try {

            const usuario =
                JSON.parse(dadosLogin);

            if (
                !usuario ||
                typeof usuario !== "object" ||
                !usuario.email
            ) {

                localStorage.removeItem("usuarioLogado");

                return null;
            }

            if (!usuario.email.includes("@")) {

                localStorage.removeItem("usuarioLogado");

                return null;
            }

            return usuario;

        } catch (erro) {

            console.log(
                "Erro ao verificar usuário:",
                erro
            );

            localStorage.removeItem(
                "usuarioLogado"
            );

            return null;
        }
    }


    // =====================================================
    // BOTÃO CRIAR PUBLICAÇÃO
    // =====================================================

    if (botao) {

        botao.addEventListener(
            "click",
            function () {

                const usuario =
                    obterUsuarioLogado();


                // -----------------------------------------
                // NÃO LOGADO
                // -----------------------------------------

                if (!usuario) {

                    const modal =
                        new bootstrap.Modal(
                            modalAcessoElemento
                        );

                    modal.show();

                    return;
                }


                // -----------------------------------------
                // LOGADO
                // -----------------------------------------

                const modal =
                    new bootstrap.Modal(
                        modalRelatoElemento
                    );

                modal.show();

            }
        );

    }


    // =====================================================
    // PUBLICAR RELATO
    // =====================================================

    if (formulario) {

        formulario.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                // -----------------------------------------
                // VERIFICAR LOGIN
                // -----------------------------------------

                const usuario =
                    obterUsuarioLogado();


                if (!usuario) {

                    alert(
                        "Você precisa estar logado para publicar um relato."
                    );

                    return;
                }


                // -----------------------------------------
                // PEGAR DADOS
                // -----------------------------------------

                const titulo =
                    document
                        .getElementById("tituloRelato")
                        .value
                        .trim();


                const tipo =
                    document
                        .getElementById("tipoRelato")
                        .value;


                const texto =
                    document
                        .getElementById("textoRelato")
                        .value
                        .trim();


                const sentimento =
                    document
                        .getElementById("sentimentoRelato")
                        .value;


                const anonimo =
                    document
                        .getElementById("anonimo")
                        .checked;


                // -----------------------------------------
                // VALIDAR
                // -----------------------------------------

                if (!titulo || !texto) {

                    alert(
                        "Preencha o título e o relato."
                    );

                    return;
                }


                // -----------------------------------------
                // PEGAR RELATOS EXISTENTES
                // -----------------------------------------

                let relatos = [];

                try {

                    relatos =
                        JSON.parse(
                            localStorage.getItem("relatos")
                        ) || [];

                } catch (erro) {

                    relatos = [];

                }


                // -----------------------------------------
                // CRIAR RELATO
                // -----------------------------------------

                const novoRelato = {

                    id: Date.now(),

                    titulo: titulo,

                    tipo: tipo,

                    texto: texto,

                    sentimento: sentimento,

                    anonimo: anonimo,

                    nome: anonimo
                        ? "Anônimo"
                        : usuario.nome || "Usuário",

                    email: usuario.email,

                    data:
                        new Date()
                            .toLocaleDateString("pt-BR"),

                    // IMPORTANTE:
                    // começa aguardando aprovação
                    status: "pendente"

                };


                // -----------------------------------------
                // SALVAR
                // -----------------------------------------

                relatos.push(novoRelato);


                localStorage.setItem(
                    "relatos",
                    JSON.stringify(relatos)
                );


                alert(
                    "Relato enviado com sucesso! Ele será analisado pelo administrador antes de ser publicado."
                );


                // -----------------------------------------
                // LIMPAR FORMULÁRIO
                // -----------------------------------------

                formulario.reset();


                // -----------------------------------------
                // FECHAR MODAL
                // -----------------------------------------

                if (modalRelatoElemento) {

                    const modal =
                        bootstrap.Modal.getInstance(
                            modalRelatoElemento
                        );

                    if (modal) {
                        modal.hide();
                    }

                }


                // -----------------------------------------
                // ATUALIZAR LISTA
                // -----------------------------------------

                mostrarRelatos();

            }
        );

    }


    // =====================================================
    // MOSTRAR RELATOS PUBLICADOS
    // =====================================================

    function mostrarRelatos() {

        const area =
            document.getElementById(
                "relatosPublicados"
            );


        if (!area) {
            return;
        }


        let relatos = [];

        try {

            relatos =
                JSON.parse(
                    localStorage.getItem("relatos")
                ) || [];

        } catch (erro) {

            relatos = [];

        }


        area.innerHTML = "";


        // =================================================
        // MOSTRAR SOMENTE RELATOS APROVADOS
        // =================================================

        const relatosPublicados =
            relatos.filter(function (relato) {

                return relato.status === "publicado";

            });


        relatosPublicados.forEach(
            function (relato) {

                const card =
                    document.createElement("div");


                card.className =
                    "card shadow-sm mb-4";


                card.innerHTML = `

                    <div class="card-body">

                        <div class="d-flex align-items-center">

                            <img
                                src="imagens/avatar.png"
                                class="foto-perfil me-3"
                                alt="Perfil"
                            >

                            <div>

                                <h6 class="mb-0">
                                    ${relato.nome}
                                </h6>

                                <small class="text-muted">
                                    ${relato.data}
                                    •
                                    ${relato.sentimento}
                                </small>

                            </div>

                        </div>


                        <span class="badge bg-primary mt-3">

                            ${relato.tipo}

                        </span>


                        <h4 class="mt-3">

                            ${relato.titulo}

                        </h4>


                        <p>

                            ${relato.texto}

                        </p>

                    </div>

                `;


                area.appendChild(card);

            }
        );


        // =================================================
        // CONTADOR
        // =================================================

        const contador =
            document.getElementById(
                "contadorRelatos"
            );


        if (contador) {

            contador.textContent =
                128 + relatosPublicados.length;

        }

    }


    // =====================================================
    // CARREGAR
    // =====================================================

    mostrarRelatos();

});