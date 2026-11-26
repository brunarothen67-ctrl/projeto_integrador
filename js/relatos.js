/* =========================================================
   RELATOS
   NAPNE - IFRS Campus Rolante
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const botao = document.getElementById("btnCriarPublicacao");
    const modalAcessoElemento = document.getElementById("modalAcesso");
    const modalRelatoElemento = document.getElementById("modalRelato");
    const formulario = document.getElementById("formRelato");
    const areaRelatos = document.getElementById("relatosPublicados");
    const mensagemSemRelatos = document.getElementById("mensagemSemRelatos");
    const pesquisa = document.getElementById("pesquisaRelatos");
    const campoFotos = document.getElementById("fotosRelato");

    let relatosCarregados = [];
    let urlsPrevias = [];

    // =====================================================
    // VERIFICAR SESSÃO
    // =====================================================

    async function obterUsuarioLogado() {

        try {

            const resposta = await fetch("/api/sessao.php", {
                credentials: "same-origin"
            });

            if (!resposta.ok) {
                return null;
            }

            const dados = await resposta.json();

            return dados.autenticado ? dados.usuario : null;

        } catch (erro) {

            console.error("Erro ao verificar sessão:", erro);
            return null;

        }

    }

    // =====================================================
    // CARREGAR FOTO DE PERFIL NA ÁREA DE PUBLICAÇÃO
    // =====================================================

    async function carregarFotoPerfilPublicacao() {

        const avatar = document.getElementById("fotoPerfilPublicacao");

        if (!avatar) {
            return;
        }

        const usuario = await obterUsuarioLogado();

        if (!usuario) {
            avatar.src = "img/avatar.svg";
            return;
        }

        try {

            const resposta = await fetch("/api/perfil.php", {
                credentials: "same-origin"
            });

            if (!resposta.ok) {
                return;
            }

            const dados = await resposta.json();
            const fotoPerfil = dados.usuario?.foto_perfil;

            if (fotoPerfil) {

                avatar.src = "/" + fotoPerfil + "?t=" + Date.now();

            } else {

                avatar.src = "img/avatar.svg";

            }

        } catch (erro) {

            console.error("Erro ao carregar foto de perfil:", erro);

        }

    }

    // =====================================================
    // ABRIR MODAL DE PUBLICAÇÃO
    // =====================================================

    if (botao) {

        botao.addEventListener("click", async function () {

            const usuario = await obterUsuarioLogado();

            if (!usuario) {

                new bootstrap.Modal(modalAcessoElemento).show();
                return;

            }

            prepararModal(null);
            bootstrap.Modal.getOrCreateInstance(modalRelatoElemento).show();

        });

    }

    // =====================================================
    // MODAL: NOVO RELATO OU EDIÇÃO
    // =====================================================

    let relatoEditando = null;
    let imagensParaRemover = [];

    function atualizarImagensExistentes() {

        const area = document.getElementById("imagensExistentes");

        if (!area) {
            return;
        }

        area.innerHTML = "";

        if (!relatoEditando) {
            return;
        }

        (relatoEditando.imagens || []).forEach(function (caminho) {

            if (imagensParaRemover.includes(caminho)) {
                return;
            }

            const bloco = document.createElement("div");
            bloco.className = "text-center";

            const img = document.createElement("img");
            img.src = "/" + caminho;
            img.alt = "Imagem já enviada";
            img.className = "rounded d-block";
            img.style.cssText = "width:140px;height:120px;object-fit:cover";

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "btn btn-sm btn-outline-danger mt-1";
            remover.textContent = "Remover";
            remover.addEventListener("click", function () {
                imagensParaRemover.push(caminho);
                atualizarImagensExistentes();
            });

            bloco.appendChild(img);
            bloco.appendChild(remover);
            area.appendChild(bloco);

        });

    }

    function prepararModal(relato) {

        relatoEditando = relato;
        imagensParaRemover = [];

        formulario.reset();

        if (typeof limparPreviaFotos === "function") {
            limparPreviaFotos();
        }

        const titulo = document.getElementById("modalRelatoLabel");

        if (titulo) {
            titulo.textContent = relato ? "Editar relato" : "Nova publicação";
        }

        const botaoEnviar = document.querySelector('button[form="formRelato"]');

        if (botaoEnviar) {
            botaoEnviar.lastChild.textContent = relato ? " Salvar e enviar para análise" : " Enviar relato";
        }

        if (relato) {

            document.getElementById("tituloRelato").value = relato.titulo || "";
            document.getElementById("tipoRelato").value = relato.tipo || "";
            document.getElementById("textoRelato").value = relato.texto || "";
            document.getElementById("anonimo").checked = Number(relato.anonimo) === 1;

            if (relato.sentimento) {
                document.getElementById("sentimentoRelato").value = relato.sentimento;
            }

        }

        atualizarImagensExistentes();

    }

    // =====================================================
    // PRÉVIA DAS IMAGENS SELECIONADAS
    // =====================================================

    let areaPreviaFotos = null;

    if (campoFotos) {

        areaPreviaFotos = document.createElement("div");
        areaPreviaFotos.className = "previa-fotos-relato d-flex flex-wrap gap-3 mt-3";

        campoFotos.insertAdjacentElement("afterend", areaPreviaFotos);

        campoFotos.addEventListener("change", function () {

            // Limpar prévias anteriores
            urlsPrevias.forEach(function (url) {
                URL.revokeObjectURL(url);
            });

            urlsPrevias = [];
            areaPreviaFotos.innerHTML = "";

            const arquivos = Array.from(campoFotos.files);

            if (arquivos.length > 5) {

                alert("Você pode selecionar no máximo 5 imagens.");
                campoFotos.value = "";
                return;

            }

            arquivos.forEach(function (arquivo) {

                if (!arquivo.type.startsWith("image/")) {
                    return;
                }

                const url = URL.createObjectURL(arquivo);
                urlsPrevias.push(url);

                const imagem = document.createElement("img");

                imagem.src = url;
                imagem.alt = "Prévia da imagem selecionada";
                imagem.className = "img-fluid rounded";

                imagem.style.width = "140px";
                imagem.style.height = "120px";
                imagem.style.objectFit = "cover";

                areaPreviaFotos.appendChild(imagem);

            });

        });

    }

    // =====================================================
    // LIMPAR PRÉVIAS
    // =====================================================

    function limparPreviaFotos() {

        urlsPrevias.forEach(function (url) {
            URL.revokeObjectURL(url);
        });

        urlsPrevias = [];

        if (areaPreviaFotos) {
            areaPreviaFotos.innerHTML = "";
        }

    }

    // =====================================================
    // ENVIAR RELATO
    // =====================================================

    if (formulario) {

        formulario.addEventListener("submit", async function (event) {

            event.preventDefault();

            const titulo = document.getElementById("tituloRelato").value.trim();
            const tipo = document.getElementById("tipoRelato").value;
            const texto = document.getElementById("textoRelato").value.trim();
            const sentimento = document.getElementById("sentimentoRelato").value;
            const anonimo = document.getElementById("anonimo").checked;

            if (!titulo || !tipo || !texto) {
                alert("Preencha os campos obrigatórios.");
                return;
            }

            const arquivos = campoFotos
                ? Array.from(campoFotos.files)
                : [];

            const mantidas = relatoEditando
                ? (relatoEditando.imagens || []).filter(function (c) {
                    return !imagensParaRemover.includes(c);
                }).length
                : 0;

            if (mantidas + arquivos.length > 5) {
                alert("Cada relato pode ter no máximo 5 imagens.");
                return;
            }

            for (const arquivo of arquivos) {

                if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
                    alert("Use somente imagens JPG, PNG ou WebP.");
                    return;
                }

                if (arquivo.size > 5 * 1024 * 1024) {
                    alert("Cada imagem deve ter no máximo 5 MB.");
                    return;
                }

            }

            // Criar envio multipart
            const dadosFormulario = new FormData();

            dadosFormulario.append("titulo", titulo);
            dadosFormulario.append("tipo", tipo);
            dadosFormulario.append("texto", texto);
            dadosFormulario.append("sentimento", sentimento);
            dadosFormulario.append("anonimo", anonimo ? "1" : "0");

            arquivos.forEach(function (arquivo) {
                dadosFormulario.append("fotos[]", arquivo);
            });

            if (relatoEditando) {

                dadosFormulario.append("id", relatoEditando.id);

                imagensParaRemover.forEach(function (caminho) {
                    dadosFormulario.append("remover[]", caminho);
                });

            }

            try {

                const resposta = await fetch("/api/relatos.php", {

                    method: "POST",

                    credentials: "same-origin",

                    body: dadosFormulario

                });

                const dados = await resposta.json();

                if (resposta.status === 401) {

                    alert("Sua sessão expirou. Entre novamente para publicar.");
                    window.location.href = "login.html";
                    return;

                }

                if (!resposta.ok) {
                    alert(dados.erro || "Não foi possível enviar o relato.");
                    return;
                }

                alert(dados.mensagem || "Relato enviado para análise.");

                prepararModal(null);

                const modal = bootstrap.Modal.getInstance(modalRelatoElemento);

                if (modal) {
                    modal.hide();
                }

                await carregarRelatos();
                await carregarMeusRelatos();

            } catch (erro) {

                console.error("Erro ao enviar relato:", erro);
                alert("Não foi possível conectar ao servidor.");

            }

        });

    }

    // =====================================================
    // FORMATAR DATA
    // =====================================================

    function formatarData(data) {

        if (!data) {
            return "";
        }

        const dataFormatada = new Date(data.replace(" ", "T"));

        if (isNaN(dataFormatada.getTime())) {
            return data;
        }

        return dataFormatada.toLocaleDateString("pt-BR");

    }

    // =====================================================
    // CRIAR ELEMENTO DE TEXTO
    // =====================================================

    function criarElemento(tag, classe, conteudo) {

        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        elemento.textContent = conteudo ?? "";

        return elemento;

    }

    // =====================================================
    // MOSTRAR IMAGENS ANEXADAS AO RELATO
    // =====================================================

    function mostrarImagensRelato(relato, corpo) {

        if (!Array.isArray(relato.imagens) || relato.imagens.length === 0) {
            return;
        }

        const areaImagens = document.createElement("div");

        areaImagens.className = "relato-galeria";

        relato.imagens.forEach(function (caminho) {

            const imagem = document.createElement("img");

            imagem.src = "/" + caminho;
            imagem.alt = "Imagem anexada ao relato";
            imagem.className = "img-fluid";

            // Clicar na miniatura abre a imagem inteira em outra aba
            const link = document.createElement("a");
            link.href = "/" + caminho;
            link.target = "_blank";
            link.rel = "noopener";

            imagem.onerror = function () {
                link.remove();
            };

            link.appendChild(imagem);
            areaImagens.appendChild(link);

        });

        corpo.appendChild(areaImagens);

    }

    // =====================================================
    // MOSTRAR RELATOS
    // =====================================================

    function mostrarRelatos(relatos) {

        if (!areaRelatos) {
            return;
        }

        areaRelatos.innerHTML = "";

        if (mensagemSemRelatos) {
            mensagemSemRelatos.style.display =
                relatos.length === 0 ? "block" : "none";
        }

        relatos.forEach(function (relato) {

            const coluna = document.createElement("div");
            coluna.className = "col-12";

            const card = document.createElement("div");
            card.className = "card shadow-sm mb-4";

            const corpo = document.createElement("div");
            corpo.className = "card-body";

            const cabecalho = document.createElement("div");
            cabecalho.className = "d-flex align-items-center";

            const avatar = document.createElement("img");

            avatar.src = (
                Number(relato.anonimo) !== 1 && relato.foto_perfil
            )
                ? "/" + relato.foto_perfil + "?t=" + Date.now()
                : "img/avatar.svg";

            avatar.alt = "Perfil";
            avatar.className = "foto-perfil me-3";

            avatar.onerror = function () {
                this.onerror = null;
                this.src = "img/avatar.svg";
            };

            const informacoes = document.createElement("div");

            informacoes.appendChild(
                criarElemento(
                    "h6",
                    "mb-0",
                    Number(relato.anonimo) === 1
                        ? "Usuário anônimo"
                        : relato.nome || "Usuário"
                )
            );

            informacoes.appendChild(
                criarElemento(
                    "small",
                    "text-muted",
                    `${formatarData(relato.criado_em)} • ${relato.sentimento || ""}`
                )
            );

            cabecalho.appendChild(avatar);
            cabecalho.appendChild(informacoes);

            corpo.appendChild(cabecalho);

            corpo.appendChild(
                criarElemento("span", "badge bg-primary mt-3", relato.tipo)
            );

            corpo.appendChild(
                criarElemento("h4", "mt-3", relato.titulo)
            );

            corpo.appendChild(
                criarElemento("p", "", relato.texto)
            );

            // Imagens anexadas ao relato
            mostrarImagensRelato(relato, corpo);

            card.appendChild(corpo);
            coluna.appendChild(card);
            areaRelatos.appendChild(coluna);

        });

        const contador = document.getElementById("contadorRelatos");

        if (contador) {
            contador.textContent = relatos.length;
        }

    }

    // =====================================================
    // CARREGAR RELATOS DO BANCO
    // =====================================================

    async function carregarRelatos() {

        if (!areaRelatos) {
            return;
        }

        areaRelatos.innerHTML = `
            <p class="text-center text-muted">Carregando relatos...</p>
        `;

        try {

            const resposta = await fetch("/api/relatos.php", {
                credentials: "same-origin"
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível consultar os relatos.");
            }

            relatosCarregados = await resposta.json();

            if (!Array.isArray(relatosCarregados)) {
                relatosCarregados = [];
            }

            aplicarPesquisa();

        } catch (erro) {

            console.error("Erro ao carregar relatos:", erro);

            areaRelatos.innerHTML = `
                <p class="text-center text-danger">
                    Não foi possível carregar os relatos.
                </p>
            `;

        }

    }

    // =====================================================
    // MEUS RELATOS (editar e excluir somente os próprios)
    // =====================================================

    async function carregarMeusRelatos() {

        const secao = document.getElementById("secaoMeusRelatos");
        const area = document.getElementById("meusRelatos");

        if (!secao || !area) {
            return;
        }

        let meus = [];

        try {

            const resposta = await fetch("/api/relatos.php?meus=1", {
                credentials: "same-origin"
            });

            if (resposta.ok) {
                meus = await resposta.json();
            }

        } catch (erro) {

            console.error("Erro ao carregar meus relatos:", erro);

        }

        area.innerHTML = "";
        secao.style.display = Array.isArray(meus) && meus.length > 0 ? "block" : "none";

        if (!Array.isArray(meus)) {
            return;
        }

        const rotulos = {
            publicado: ["bg-success", "Publicado"],
            pendente: ["bg-warning text-dark", "Aguardando aprovação"],
            reprovado: ["bg-danger", "Reprovado"]
        };

        meus.forEach(function (relato) {

            const coluna = document.createElement("div");
            coluna.className = "col-12";

            const card = document.createElement("div");
            card.className = "card shadow-sm";

            const corpo = document.createElement("div");
            corpo.className = "card-body";

            const [classe, texto] = rotulos[relato.status] || rotulos.pendente;

            corpo.appendChild(criarElemento("span", "badge " + classe, texto));
            corpo.appendChild(criarElemento("h5", "mt-2", relato.titulo));
            corpo.appendChild(criarElemento(
                "small",
                "text-muted d-block mb-2",
                relato.tipo + " • " + formatarData(relato.criado_em) +
                    (Number(relato.anonimo) === 1 ? " • anônimo" : "")
            ));
            corpo.appendChild(criarElemento("p", "", relato.texto));

            mostrarImagensRelato(relato, corpo);

            const botoes = document.createElement("div");
            botoes.className = "d-flex gap-2 mt-3";

            const editar = criarElemento("button", "btn btn-sm btn-outline-primary", "Editar");
            editar.type = "button";
            editar.addEventListener("click", function () {

                if (relato.status === "publicado" &&
                    !confirm("Ao editar, o relato sai do site e volta para aprovação do administrador. Continuar?")) {
                    return;
                }

                prepararModal(relato);
                bootstrap.Modal.getOrCreateInstance(modalRelatoElemento).show();

            });

            const excluir = criarElemento("button", "btn btn-sm btn-outline-danger", "Excluir");
            excluir.type = "button";
            excluir.addEventListener("click", async function () {

                if (!confirm("Deseja realmente excluir este relato?")) {
                    return;
                }

                try {

                    const resposta = await fetch("/api/relatos.php", {
                        method: "DELETE",
                        credentials: "same-origin",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: relato.id })
                    });

                    const dados = await resposta.json();

                    if (!resposta.ok) {
                        alert(dados.erro || "Não foi possível excluir o relato.");
                        return;
                    }

                    await carregarRelatos();
                    await carregarMeusRelatos();

                } catch (erro) {

                    console.error("Erro ao excluir relato:", erro);
                    alert("Não foi possível conectar ao servidor.");

                }

            });

            botoes.appendChild(editar);
            botoes.appendChild(excluir);
            corpo.appendChild(botoes);

            card.appendChild(corpo);
            coluna.appendChild(card);
            area.appendChild(coluna);

        });

    }

    // =====================================================
    // PESQUISAR RELATOS
    // =====================================================

    function aplicarPesquisa() {

        const termo = pesquisa
            ? pesquisa.value.trim().toLowerCase()
            : "";

        const filtrados = relatosCarregados.filter(function (relato) {

            return (
                (relato.titulo || "").toLowerCase().includes(termo) ||
                (relato.texto || "").toLowerCase().includes(termo) ||
                (relato.tipo || "").toLowerCase().includes(termo)
            );

        });

        mostrarRelatos(filtrados);

    }

    if (pesquisa) {
        pesquisa.addEventListener("input", aplicarPesquisa);
    }

    // =====================================================
    // INICIAR
    // =====================================================

    carregarFotoPerfilPublicacao();
    carregarRelatos();
    carregarMeusRelatos();

});
