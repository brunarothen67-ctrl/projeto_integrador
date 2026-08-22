/* =========================================================
   MATERIAIS - ÁREA PÚBLICA
   NAPNE - IFRS Campus Rolante
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const lista = document.getElementById("listaMateriais");

    if (!lista) {
        return;
    }

    // Categoria definida pela página
    const categoria = lista.dataset.categoria;

    // Buscar materiais publicados pelo administrador
    const materiais =
        JSON.parse(
            localStorage.getItem("materiaisNAPNE")
        ) || [];

    // Filtrar somente os materiais da categoria atual
    const materiaisCategoria =
        materiais.filter(function (material) {

            return material.categoria === categoria;

        });

    // Limpar a lista
    lista.innerHTML = "";

    // Nenhum material publicado
    if (materiaisCategoria.length === 0) {

        lista.innerHTML = `

            <div class="sem-materiais">

                <i class="bi bi-file-earmark-text"></i>

                <h3>
                    Nenhum material disponível
                </h3>

                <p>
                    Ainda não há materiais publicados nesta categoria.
                </p>

            </div>

        `;

        return;
    }

    // Criar os cards
    materiaisCategoria.forEach(function (material) {

        const card =
            document.createElement("article");

        card.className = "material-card";

        card.innerHTML = `

            <div class="material-icone">

                <i class="bi bi-file-earmark-text"></i>

            </div>

            <h3>
                ${material.titulo}
            </h3>

            <p>
                ${material.descricao}
            </p>

            <a
                href="${material.link}"
                class="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
            >

                <i class="bi bi-box-arrow-up-right"></i>

                Acessar material

            </a>

        `;

        lista.appendChild(card);

    });

});