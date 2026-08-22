document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formProjeto");
    const lista = document.getElementById("listaProjetos");
    const campoImagem = document.getElementById("imagemProjeto");

    if (!form || !lista) {
        return;
    }


    // =====================================================
    // PEGAR PROJETOS DO LOCALSTORAGE
    // =====================================================

    function obterProjetos() {

        return JSON.parse(
            localStorage.getItem("projetosNAPNE")
        ) || [];

    }


    // =====================================================
    // SALVAR PROJETOS
    // =====================================================

    function salvarProjetos(projetos) {

        localStorage.setItem(
            "projetosNAPNE",
            JSON.stringify(projetos)
        );

    }


    // =====================================================
    // CONVERTER IMAGEM PARA BASE64
    // =====================================================

    function converterImagemParaBase64(arquivo) {

        return new Promise(function (resolve, reject) {

            if (!arquivo) {

                resolve("");

                return;
            }


            const leitor = new FileReader();


            leitor.onload = function () {

                resolve(leitor.result);

            };


            leitor.onerror = function () {

                reject(
                    new Error(
                        "Não foi possível carregar a imagem."
                    )
                );

            };


            leitor.readAsDataURL(arquivo);

        });

    }


    // =====================================================
    // MOSTRAR PROJETOS
    // =====================================================

    function mostrarProjetos() {

        const projetos = obterProjetos();

        lista.innerHTML = "";


        // Nenhum projeto

        if (projetos.length === 0) {

            lista.innerHTML = `
                <div class="alert alert-info">
                    Nenhum projeto cadastrado ainda.
                </div>
            `;

            return;
        }


        // Criar os cards

        projetos.forEach(function (projeto) {

            const card =
                document.createElement("div");


            card.className =
                "projeto-card";


            card.innerHTML = `

                <div class="projeto-icone">

                    <i class="bi bi-folder2-open"></i>

                </div>


                <span class="categoria">
                    ${projeto.categoria}
                </span>


                <h3>
                    ${projeto.titulo}
                </h3>


                ${
                    projeto.imagem

                    ?

                    `
                    <div class="imagem-projeto">

                        <img
                            src="${projeto.imagem}"
                            alt="Imagem do projeto ${projeto.titulo}"
                        >

                    </div>
                    `

                    :

                    `
                    <div class="imagem-projeto imagem-sem-foto">

                        <i class="bi bi-image"></i>

                    </div>
                    `
                }


                <p>
                    ${projeto.descricao}
                </p>


                <span class="status-projeto">
                    ${projeto.status}
                </span>


                <div class="acoes-projeto">


                    <button
                        type="button"
                        class="btn btn-outline-primary btn-projeto btn-editar"
                        data-id="${projeto.id}"
                    >

                        <i class="bi bi-pencil"></i>

                        Editar

                    </button>


                    <button
                        type="button"
                        class="btn btn-outline-danger btn-projeto btn-excluir"
                        data-id="${projeto.id}"
                    >

                        <i class="bi bi-trash"></i>

                        Excluir

                    </button>


                </div>

            `;


            lista.appendChild(card);

        });


        adicionarEventosBotoes();

    }


    // =====================================================
    // BOTÕES EDITAR E EXCLUIR
    // =====================================================

    function adicionarEventosBotoes() {


        // =================================================
        // EDITAR
        // =================================================

        const botoesEditar =
            document.querySelectorAll(".btn-editar");


        botoesEditar.forEach(function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const id =
                        Number(this.dataset.id);


                    const projetos =
                        obterProjetos();


                    const projeto =
                        projetos.find(function (item) {

                            return item.id === id;

                        });


                    if (!projeto) {
                        return;
                    }


                    // Preencher formulário

                    document.getElementById(
                        "tituloProjeto"
                    ).value =
                        projeto.titulo;


                    document.getElementById(
                        "categoriaProjeto"
                    ).value =
                        projeto.categoria;


                    document.getElementById(
                        "descricaoProjeto"
                    ).value =
                        projeto.descricao;


                    document.getElementById(
                        "statusProjeto"
                    ).value =
                        projeto.status;


                    /*
                        O input type="file" não pode
                        receber automaticamente a imagem
                        que já está salva.

                        Por isso guardamos a imagem
                        atual no formulário.
                    */

                    form.setAttribute(
                        "data-editando",
                        id
                    );


                    form.setAttribute(
                        "data-imagem-atual",
                        projeto.imagem || ""
                    );


                    // Alterar botão

                    const botaoSalvar =
                        form.querySelector(
                            'button[type="submit"]'
                        );


                    botaoSalvar.innerHTML = `
                        <i class="bi bi-check-circle"></i>
                        Atualizar projeto
                    `;


                    // Alterar título

                    const tituloFormulario =
                        document.querySelector(
                            ".admin-form-card"
                        )
                        .closest(".admin-section")
                        .querySelector("h2");


                    if (tituloFormulario) {

                        tituloFormulario.textContent =
                            "Editar projeto";

                    }


                    // Voltar para o formulário

                    document
                        .querySelector(".admin-form-card")
                        .scrollIntoView({

                            behavior: "smooth",

                            block: "start"

                        });

                }
            );

        });


        // =================================================
        // EXCLUIR
        // =================================================

        const botoesExcluir =
            document.querySelectorAll(".btn-excluir");


        botoesExcluir.forEach(function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const id =
                        Number(this.dataset.id);


                    const confirmar =
                        confirm(
                            "Deseja realmente excluir este projeto?"
                        );


                    if (!confirmar) {
                        return;
                    }


                    let projetos =
                        obterProjetos();


                    projetos =
                        projetos.filter(
                            function (projeto) {

                                return projeto.id !== id;

                            }
                        );


                    salvarProjetos(projetos);


                    mostrarProjetos();

                }
            );

        });

    }


    // =====================================================
    // CADASTRAR OU EDITAR PROJETO
    // =====================================================

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =================================================
            // PEGAR DADOS DO FORMULÁRIO
            // =================================================

            const titulo =
                document
                    .getElementById("tituloProjeto")
                    .value
                    .trim();


            const categoria =
                document
                    .getElementById("categoriaProjeto")
                    .value;


            const descricao =
                document
                    .getElementById("descricaoProjeto")
                    .value
                    .trim();


            const status =
                document
                    .getElementById("statusProjeto")
                    .value;


            const arquivoImagem =
                campoImagem.files[0];


            // =================================================
            // VALIDAÇÃO
            // =================================================

            if (
                !titulo ||
                !categoria ||
                !descricao
            ) {

                alert(
                    "Preencha todos os campos obrigatórios."
                );

                return;
            }


            let projetos =
                obterProjetos();


            const idEditando =
                form.getAttribute("data-editando");


            // =================================================
            // DEFINIR IMAGEM
            // =================================================

            let imagem = "";


            /*
                Se estiver editando,
                mantém a imagem antiga.
            */

            if (idEditando) {

                imagem =
                    form.getAttribute(
                        "data-imagem-atual"
                    ) || "";

            }


            /*
                Se selecionou uma nova imagem,
                substitui a antiga.
            */

            if (arquivoImagem) {

                try {

                    imagem =
                        await converterImagemParaBase64(
                            arquivoImagem
                        );

                } catch (erro) {

                    alert(
                        "Não foi possível carregar a imagem."
                    );

                    return;

                }

            }


            // =================================================
            // EDITAR PROJETO
            // =================================================

            if (idEditando) {

                const id =
                    Number(idEditando);


                projetos =
                    projetos.map(
                        function (projeto) {

                            if (
                                projeto.id === id
                            ) {

                                return {

                                    id:
                                        projeto.id,

                                    titulo:
                                        titulo,

                                    categoria:
                                        categoria,

                                    imagem:
                                        imagem,

                                    descricao:
                                        descricao,

                                    status:
                                        status

                                };

                            }


                            return projeto;

                        }
                    );


                salvarProjetos(projetos);


                alert(
                    "Projeto atualizado com sucesso!"
                );


                limparFormulario();


                mostrarProjetos();


                return;

            }


            // =================================================
            // NOVO PROJETO
            // =====================================================

            const novoProjeto = {

                id:
                    Date.now(),

                titulo:
                    titulo,

                categoria:
                    categoria,

                imagem:
                    imagem,

                descricao:
                    descricao,

                status:
                    status

            };


            projetos.push(
                novoProjeto
            );


            salvarProjetos(
                projetos
            );


            alert(
                "Projeto cadastrado com sucesso!"
            );


            limparFormulario();


            mostrarProjetos();

        }
    );


    // =====================================================
    // LIMPAR FORMULÁRIO
    // =====================================================

    function limparFormulario() {

        form.reset();


        form.removeAttribute(
            "data-editando"
        );


        form.removeAttribute(
            "data-imagem-atual"
        );


        const botaoSalvar =
            form.querySelector(
                'button[type="submit"]'
            );


        botaoSalvar.innerHTML = `
            <i class="bi bi-plus-circle"></i>
            Salvar projeto
        `;


        const tituloFormulario =
            document.querySelector(
                ".admin-form-card"
            )
            .closest(".admin-section")
            .querySelector("h2");


        if (tituloFormulario) {

            tituloFormulario.textContent =
                "Novo projeto";

        }

    }


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


    if (
        btnMenu &&
        sidebar
    ) {

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
    // CARREGAR PROJETOS AO ABRIR
    // =====================================================

    mostrarProjetos();

});