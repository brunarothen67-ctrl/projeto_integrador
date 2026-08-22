document.addEventListener("DOMContentLoaded", function () {

    const lista =
        document.getElementById("listaProjetos");

    if (!lista) {
        return;
    }


    // =====================================================
    // BUSCAR PROJETOS
    // =====================================================

    const projetos =
        JSON.parse(
            localStorage.getItem("projetosNAPNE")
        ) || [];


    // =====================================================
    // CASO NÃO TENHA PROJETOS
    // =====================================================

    if (projetos.length === 0) {

        lista.innerHTML = `

            <div class="col-12">

                <div class="text-center py-5">

                    <i
                        class="bi bi-folder2-open"
                        style="font-size: 3rem;"
                    ></i>

                    <h3 class="mt-3">
                        Nenhum projeto publicado
                    </h3>

                    <p>
                        Os projetos publicados pelo NAPNE
                        aparecerão aqui.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    // =====================================================
    // MOSTRAR PROJETOS ATIVOS
    // =====================================================

    projetos
        .filter(function (projeto) {

            return projeto.status === "Ativo";

        })
        .forEach(function (projeto) {

            const coluna =
                document.createElement("div");

            coluna.className =
                "col-md-4";


            coluna.innerHTML = `

                <article class="projeto-card h-100">


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
                        <div
                            class="imagem-projeto d-flex align-items-center justify-content-center"
                        >

                            <i
                                class="bi bi-folder2-open"
                                style="font-size: 4rem;"
                            ></i>

                        </div>
                        `
                    }


                    <div class="card-body">

                        <i class="bi bi-universal-access"></i>


                        <h3>
                            ${projeto.titulo}
                        </h3>


                        <p>
                            ${projeto.descricao}
                        </p>


                        <span class="badge">
                            ${projeto.categoria}
                        </span>

                    </div>

                </article>

            `;


            lista.appendChild(coluna);

        });

});