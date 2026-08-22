/* =========================================================
   MATERIAIS - PAINEL ADMINISTRATIVO
   NAPNE - IFRS Campus Rolante
========================================================= */


document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // FORMULÁRIO
    // =====================================================

    const formulario =
        document.getElementById("formMaterial");


    const lista =
        document.getElementById("listaMateriais");


    if (!formulario || !lista) {

        return;

    }


    // =====================================================
    // BUSCAR MATERIAIS SALVOS
    // =====================================================

    let materiais =
        JSON.parse(
            localStorage.getItem("materiaisNAPNE")
        ) || [];


    // =====================================================
    // NOMES DAS CATEGORIAS
    // =====================================================

    const nomesCategorias = {

        "legislacao":
            "Legislação e normativas",

        "normativas-ifrs":
            "Normativas do IFRS",

        "livros-artigos":
            "Livros e artigos",

        "guias-materiais":
            "Guias e materiais de apoio"

    };


    // =====================================================
    // MOSTRAR MATERIAIS
    // =====================================================

    function mostrarMateriais() {


        lista.innerHTML = "";


        // Nenhum material

        if (materiais.length === 0) {

            lista.innerHTML = `

                <div class="admin-empty-state">

                    <i class="bi bi-file-earmark-text"></i>

                    <h3>
                        Nenhum material cadastrado
                    </h3>

                    <p>
                        Os materiais adicionados aparecerão
                        nesta área.
                    </p>

                </div>

            `;

            return;

        }


        // Criar os cards

        materiais.forEach(function (material, index) {


            const card =
                document.createElement("div");


            card.className =
                "material-admin-card";


            card.innerHTML = `

                <span class="material-admin-categoria">

                    ${nomesCategorias[material.categoria]}

                </span>


                <h3>

                    ${material.titulo}

                </h3>


                <p>

                    ${material.descricao}

                </p>


                <a
                    href="${material.link}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="material-admin-link"
                >

                    <i class="bi bi-box-arrow-up-right"></i>

                    Acessar material

                </a>


                <div class="material-admin-acoes">

                    <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        data-index="${index}"
                    >

                        <i class="bi bi-trash"></i>

                        Excluir

                    </button>

                </div>

            `;


            lista.appendChild(card);

        });


        // =================================================
        // BOTÕES EXCLUIR
        // =================================================

        const botoesExcluir =
            lista.querySelectorAll(
                ".material-admin-acoes button"
            );


        botoesExcluir.forEach(function (botao) {


            botao.addEventListener(
                "click",
                function () {


                    const index =
                        Number(
                            botao.dataset.index
                        );


                    const confirmar =
                        confirm(
                            "Tem certeza que deseja excluir este material?"
                        );


                    if (!confirmar) {

                        return;

                    }


                    materiais.splice(index, 1);


                    localStorage.setItem(
                        "materiaisNAPNE",
                        JSON.stringify(materiais)
                    );


                    mostrarMateriais();

                }
            );

        });

    }


    // =====================================================
    // PUBLICAR MATERIAL
    // =====================================================

    formulario.addEventListener(
        "submit",
        function (event) {


            event.preventDefault();


            // =================================================
            // PEGAR DADOS
            // =================================================

            const categoria =
                document
                    .getElementById(
                        "categoriaMaterial"
                    )
                    .value;


            const titulo =
                document
                    .getElementById(
                        "tituloMaterial"
                    )
                    .value
                    .trim();


            const descricao =
                document
                    .getElementById(
                        "descricaoMaterial"
                    )
                    .value
                    .trim();


            const link =
                document
                    .getElementById(
                        "linkMaterial"
                    )
                    .value
                    .trim();


            // =================================================
            // VERIFICAR
            // =================================================

            if (
                !categoria ||
                !titulo ||
                !descricao ||
                !link
            ) {

                alert(
                    "Preencha todos os campos."
                );

                return;

            }


            // =================================================
            // CRIAR MATERIAL
            // =================================================

            const novoMaterial = {

                id: Date.now(),

                categoria: categoria,

                titulo: titulo,

                descricao: descricao,

                link: link

            };


            // =================================================
            // SALVAR
            // =================================================

            materiais.push(novoMaterial);


            localStorage.setItem(
                "materiaisNAPNE",
                JSON.stringify(materiais)
            );


            // =================================================
            // LIMPAR FORMULÁRIO
            // =================================================

            formulario.reset();


            // =================================================
            // ATUALIZAR LISTA
            // =================================================

            mostrarMateriais();


            // =================================================
            // MENSAGEM
            // =================================================

            alert(
                "Material publicado com sucesso!"
            );

        }
    );


    // =====================================================
    // CARREGAR MATERIAIS AO ABRIR A PÁGINA
    // =====================================================

    mostrarMateriais();

});