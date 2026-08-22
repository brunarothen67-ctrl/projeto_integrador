document.addEventListener("DOMContentLoaded", function () {

    const lista =
        document.getElementById("listaEventos");

    if (!lista) {
        return;
    }


    // =====================================================
    // BUSCAR EVENTOS DO LOCALSTORAGE
    // =====================================================

    const eventos =
        JSON.parse(
            localStorage.getItem("eventosNAPNE")
        ) || [];


    // =====================================================
    // NENHUM EVENTO
    // =====================================================

    if (eventos.length === 0) {

        lista.innerHTML = `

            <div class="col-12">

                <div class="text-center py-5">

                    <i
                        class="bi bi-calendar-event"
                        style="font-size: 3rem;"
                    ></i>

                    <h3 class="mt-3">
                        Nenhum evento publicado
                    </h3>

                    <p>
                        Os próximos eventos promovidos pelo
                        NAPNE aparecerão aqui.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    // =====================================================
    // MOSTRAR EVENTOS
    // =====================================================

    eventos.forEach(function (evento) {

        const coluna =
            document.createElement("div");

        coluna.className =
            "col-md-4";


        // =================================================
        // FORMATAR DATA
        // =================================================

        let dataFormatada = "";

        if (evento.data) {

            const partes =
                evento.data.split("-");

            if (partes.length === 3) {

                dataFormatada =
                    `${partes[2]}/${partes[1]}/${partes[0]}`;

            }

        }


        // =================================================
        // CRIAR CARD
        // =================================================

        coluna.innerHTML = `

            <div class="card-evento">


                ${
                    evento.imagem
                    ?
                    `
                    <div class="imagem-evento">

                        <img
                            src="${evento.imagem}"
                            alt="Imagem do evento ${evento.titulo}"
                        >

                    </div>
                    `
                    :
                    `
                    <div class="evento-icone">

                        <i class="bi bi-calendar-event"></i>

                    </div>
                    `
                }


                <h3>
                    ${evento.titulo}
                </h3>


                <p>

                    <i class="bi bi-calendar3"></i>

                    ${dataFormatada}

                </p>


                ${
                    evento.horario
                    ?
                    `
                    <p>

                        <i class="bi bi-clock"></i>

                        ${evento.horario}

                    </p>
                    `
                    :
                    ""
                }


                <p>

                    <i class="bi bi-geo-alt"></i>

                    ${evento.local}

                </p>


                <p>
                    ${evento.descricao}
                </p>


            </div>

        `;


        // =================================================
        // ADICIONAR CARD À LISTA
        // =================================================

        lista.appendChild(coluna);

    });

});