document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formEvento");
    const lista = document.getElementById("listaEventos");

    if (!form || !lista) {
        return;
    }


    // =====================================================
    // PEGAR EVENTOS DO LOCALSTORAGE
    // =====================================================

    function obterEventos() {

        return JSON.parse(
            localStorage.getItem("eventosNAPNE")
        ) || [];

    }


    // =====================================================
    // SALVAR EVENTOS
    // =====================================================

    function salvarEventos(eventos) {

        localStorage.setItem(
            "eventosNAPNE",
            JSON.stringify(eventos)
        );

    }


    // =====================================================
    // LIMPAR FORMULÁRIO
    // =====================================================

    function limparFormulario() {

        form.reset();

        form.removeAttribute("data-editando");

        document.getElementById(
            "previewImagemEvento"
        ).innerHTML = "";

        document.getElementById(
            "btnSalvarEvento"
        ).innerHTML = `
            <i class="bi bi-plus-circle"></i>
            Publicar evento
        `;

        document.getElementById(
            "tituloFormularioEvento"
        ).textContent = "Novo evento";

    }


    // =====================================================
    // MOSTRAR PREVISUALIZAÇÃO DA IMAGEM
    // =====================================================

    const campoImagem =
        document.getElementById("imagemEvento");

    const preview =
        document.getElementById("previewImagemEvento");


    campoImagem.addEventListener("change", function () {

        const arquivo = this.files[0];

        if (!arquivo) {

            preview.innerHTML = "";

            return;
        }


        if (!arquivo.type.startsWith("image/")) {

            alert("Selecione um arquivo de imagem.");

            this.value = "";

            preview.innerHTML = "";

            return;
        }


        const leitor = new FileReader();


        leitor.onload = function (event) {

            preview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Pré-visualização da imagem"
                    style="
                        max-width: 300px;
                        max-height: 200px;
                        object-fit: cover;
                        border-radius: 12px;
                        display: block;
                    "
                >

            `;

        };


        leitor.readAsDataURL(arquivo);

    });


    // =====================================================
    // MOSTRAR EVENTOS
    // =====================================================

    function mostrarEventos() {

        const eventos = obterEventos();

        lista.innerHTML = "";


        // Nenhum evento

        if (eventos.length === 0) {

            lista.innerHTML = `

                <div class="alert alert-info">

                    Nenhum evento publicado ainda.

                </div>

            `;

            return;
        }


        // Criar os cards

        eventos.forEach(function (evento) {

            const card =
                document.createElement("div");

            card.className =
                "evento-admin-card";


            // Formatar data

            let dataFormatada = "";

            if (evento.data) {

                const partes =
                    evento.data.split("-");

                if (partes.length === 3) {

                    dataFormatada =
                        `${partes[2]}/${partes[1]}/${partes[0]}`;

                }

            }


            card.innerHTML = `

                ${
                    evento.imagem
                    ?
                    `
                    <div class="imagem-evento-admin">

                        <img
                            src="${evento.imagem}"
                            alt="Imagem do evento ${evento.titulo}"
                        >

                    </div>
                    `
                    :
                    `
                    <div class="evento-admin-icone">

                        <i class="bi bi-calendar-event"></i>

                    </div>
                    `
                }


                <h3>
                    ${evento.titulo}
                </h3>


                <div class="evento-admin-info">


                    <span>

                        <i class="bi bi-calendar3"></i>

                        ${dataFormatada}

                    </span>


                    ${
                        evento.horario
                        ?
                        `
                        <span>

                            <i class="bi bi-clock"></i>

                            ${evento.horario}

                        </span>
                        `
                        :
                        ""
                    }


                    <span>

                        <i class="bi bi-geo-alt"></i>

                        ${evento.local}

                    </span>


                </div>


                <p>

                    ${evento.descricao}

                </p>


                <div class="evento-admin-acoes">


                    <button
                        type="button"
                        class="btn btn-outline-primary btn-evento btn-editar-evento"
                        data-id="${evento.id}"
                    >

                        <i class="bi bi-pencil"></i>

                        Editar

                    </button>


                    <button
                        type="button"
                        class="btn btn-outline-danger btn-evento btn-excluir-evento"
                        data-id="${evento.id}"
                    >

                        <i class="bi bi-trash"></i>

                        Excluir

                    </button>


                </div>

            `;


            lista.appendChild(card);

        });


        configurarBotoesEditar();

        configurarBotoesExcluir();

    }


    // =====================================================
    // EDITAR EVENTO
    // =====================================================

    function configurarBotoesEditar() {

        const botoes =
            document.querySelectorAll(
                ".btn-editar-evento"
            );


        botoes.forEach(function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const id =
                        Number(this.dataset.id);


                    const eventos =
                        obterEventos();


                    const evento =
                        eventos.find(function (item) {

                            return item.id === id;

                        });


                    if (!evento) {
                        return;
                    }


                    // Preencher formulário

                    document.getElementById(
                        "tituloEvento"
                    ).value =
                        evento.titulo;


                    document.getElementById(
                        "dataEvento"
                    ).value =
                        evento.data;


                    document.getElementById(
                        "horarioEvento"
                    ).value =
                        evento.horario || "";


                    document.getElementById(
                        "localEvento"
                    ).value =
                        evento.local;


                    document.getElementById(
                        "descricaoEvento"
                    ).value =
                        evento.descricao;


                    // Guardar imagem antiga

                    form.setAttribute(
                        "data-imagem-atual",
                        evento.imagem || ""
                    );


                    // Guardar ID

                    form.setAttribute(
                        "data-editando",
                        id
                    );


                    // Alterar botão

                    document.getElementById(
                        "btnSalvarEvento"
                    ).innerHTML = `

                        <i class="bi bi-check-circle"></i>

                        Atualizar evento

                    `;


                    // Alterar título

                    document.getElementById(
                        "tituloFormularioEvento"
                    ).textContent =
                        "Editar evento";


                    // Mostrar imagem atual

                    if (evento.imagem) {

                        preview.innerHTML = `

                            <p class="text-muted mb-2">
                                Imagem atual:
                            </p>

                            <img
                                src="${evento.imagem}"
                                alt="Imagem atual do evento"
                                style="
                                    max-width: 300px;
                                    max-height: 200px;
                                    object-fit: cover;
                                    border-radius: 12px;
                                    display: block;
                                "
                            >

                        `;

                    } else {

                        preview.innerHTML = "";

                    }


                    // Voltar para o formulário

                    document
                        .querySelector(
                            ".admin-form-card"
                        )
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                }
            );

        });

    }


    // =====================================================
    // EXCLUIR EVENTO
    // =====================================================

    function configurarBotoesExcluir() {

        const botoes =
            document.querySelectorAll(
                ".btn-excluir-evento"
            );


        botoes.forEach(function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const id =
                        Number(this.dataset.id);


                    const confirmar =
                        confirm(
                            "Deseja realmente excluir este evento?"
                        );


                    if (!confirmar) {
                        return;
                    }


                    let eventos =
                        obterEventos();


                    eventos =
                        eventos.filter(
                            function (evento) {

                                return evento.id !== id;

                            }
                        );


                    salvarEventos(eventos);

                    mostrarEventos();

                }
            );

        });

    }


    // =====================================================
    // PUBLICAR OU ATUALIZAR
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ---------------------------------------------
            // PEGAR DADOS
            // ---------------------------------------------

            const titulo =
                document
                    .getElementById("tituloEvento")
                    .value
                    .trim();


            const data =
                document
                    .getElementById("dataEvento")
                    .value;


            const horario =
                document
                    .getElementById("horarioEvento")
                    .value;


            const local =
                document
                    .getElementById("localEvento")
                    .value
                    .trim();


            const descricao =
                document
                    .getElementById("descricaoEvento")
                    .value
                    .trim();


            const arquivo =
                campoImagem.files[0];


            // ---------------------------------------------
            // VALIDAR
            // ---------------------------------------------

            if (
                !titulo ||
                !data ||
                !local ||
                !descricao
            ) {

                alert(
                    "Preencha todos os campos obrigatórios."
                );

                return;
            }


            let eventos =
                obterEventos();


            // ---------------------------------------------
            // VERIFICAR SE ESTÁ EDITANDO
            // ---------------------------------------------

            const idEditando =
                form.getAttribute("data-editando");


            // =================================================
            // EDITAR
            // =================================================

            if (idEditando) {

                const id =
                    Number(idEditando);


                const imagemAtual =
                    form.getAttribute(
                        "data-imagem-atual"
                    ) || "";


                function atualizarEvento(imagem) {

                    eventos =
                        eventos.map(
                            function (evento) {

                                if (evento.id === id) {

                                    return {

                                        id: evento.id,

                                        titulo: titulo,

                                        data: data,

                                        horario: horario,

                                        local: local,

                                        imagem: imagem,

                                        descricao: descricao

                                    };

                                }


                                return evento;

                            }
                        );


                    salvarEventos(eventos);


                    alert(
                        "Evento atualizado com sucesso!"
                    );


                    limparFormulario();

                    mostrarEventos();

                }


                // Se escolheu uma nova imagem

                if (arquivo) {

                    const leitor =
                        new FileReader();


                    leitor.onload =
                        function (event) {

                            atualizarEvento(
                                event.target.result
                            );

                        };


                    leitor.readAsDataURL(
                        arquivo
                    );

                } else {

                    // Mantém a imagem antiga

                    atualizarEvento(
                        imagemAtual
                    );

                }


                return;

            }


            // =================================================
            // NOVO EVENTO
            // =================================================

            function publicarEvento(imagem) {

                const novoEvento = {

                    id: Date.now(),

                    titulo: titulo,

                    data: data,

                    horario: horario,

                    local: local,

                    imagem: imagem,

                    descricao: descricao

                };


                eventos.push(
                    novoEvento
                );


                salvarEventos(
                    eventos
                );


                alert(
                    "Evento publicado com sucesso!"
                );


                limparFormulario();

                mostrarEventos();

            }


            // ---------------------------------------------
            // IMAGEM
            // ---------------------------------------------

            if (arquivo) {

                const leitor =
                    new FileReader();


                leitor.onload =
                    function (event) {

                        publicarEvento(
                            event.target.result
                        );

                    };


                leitor.readAsDataURL(
                    arquivo
                );

            } else {

                publicarEvento("");

            }

        }
    );


    // =====================================================
    // MENU MOBILE
    // =====================================================

    const btnMenu =
        document.getElementById(
            "btnMenuAdmin"
        );


    const sidebar =
        document.getElementById(
            "adminSidebar"
        );


    if (btnMenu && sidebar) {

        btnMenu.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "aberta"
                );

            }
        );

    }


    // =====================================================
    // SAIR DO ADMIN
    // =====================================================

    const btnSair =
        document.getElementById(
            "btnSairAdmin"
        );


    if (btnSair) {

        btnSair.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "usuarioLogado"
                );


                window.location.href =
                    "../index.html";

            }
        );

    }


    // =====================================================
    // CARREGAR EVENTOS
    // =====================================================

    mostrarEventos();

});