/* =========================================================
   NOTIFICAÇÕES
   Substitui o alert() do navegador por avisos no próprio site
   (verde = sucesso, vermelho = erro). Acessível para leitores
   de tela (aria-live) e respeita "reduzir movimento".
========================================================= */

(function () {

    const CHAVE_PENDENTE = "napne_notificacao_pendente";
    const PADRAO_SUCESSO = /sucesso|enviado|atualizad|publicad|excluíd|salv|redefinid|realizad|cadastrad|removid/i;

    const CSS = `
    #napne-avisos {
        position: fixed; top: 20px; right: 20px; z-index: 20000;
        display: flex; flex-direction: column; gap: 12px;
        width: min(380px, calc(100vw - 32px)); pointer-events: none;
    }
    .napne-aviso {
        pointer-events: auto; display: flex; align-items: flex-start; gap: 12px;
        background: #fff; color: #2C3E50; padding: 14px 14px 14px 16px;
        border-radius: 14px; border-left: 6px solid var(--cor);
        box-shadow: 0 12px 32px rgba(10, 55, 107, .22);
        font: 500 .95rem/1.45 'Inter', 'Segoe UI', Arial, sans-serif;
        animation: napne-entra .25s ease-out;
    }
    .napne-aviso.sai { animation: napne-sai .2s ease-in forwards; }
    .napne-aviso-icone {
        flex: 0 0 28px; height: 28px; border-radius: 50%; background: var(--cor);
        color: #fff; display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 1rem; line-height: 1;
    }
    .napne-aviso-texto { flex: 1; padding-top: 3px; overflow-wrap: anywhere; white-space: pre-line; }
    .napne-aviso-fechar {
        background: none; border: 0; color: #5F6B7A; font-size: 1.3rem; line-height: 1;
        cursor: pointer; padding: 2px 6px; border-radius: 6px;
    }
    .napne-aviso-fechar:hover { background: #EAF5FF; }
    .napne-aviso-fechar:focus-visible { outline: 3px solid #FFD54A; }
    @keyframes napne-entra { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
    @keyframes napne-sai { to { opacity: 0; transform: translateX(24px); } }
    @media (max-width: 576px) {
        #napne-avisos { top: auto; bottom: 16px; right: 16px; left: 16px; width: auto; }
    }
    @media (prefers-reduced-motion: reduce) {
        .napne-aviso, .napne-aviso.sai { animation: none; }
    }`;

    function garantirContainer() {

        let area = document.getElementById("napne-avisos");

        if (area) {
            return area;
        }

        const estilo = document.createElement("style");
        estilo.textContent = CSS;
        document.head.appendChild(estilo);

        area = document.createElement("div");
        area.id = "napne-avisos";
        document.body.appendChild(area);

        return area;
    }

    function fechar(aviso) {

        if (!aviso.parentNode) {
            return;
        }

        aviso.classList.add("sai");
        setTimeout(function () { aviso.remove(); }, 200);
    }

    function mostrar(texto, tipo) {

        const erro = tipo === "erro";
        const area = garantirContainer();
        const aviso = document.createElement("div");

        aviso.className = "napne-aviso";
        aviso.style.setProperty("--cor", erro ? "#C62F3E" : "#2F9E6A");
        aviso.setAttribute("role", erro ? "alert" : "status");
        aviso.dataset.texto = texto;
        aviso.dataset.tipo = tipo;

        const icone = document.createElement("div");
        icone.className = "napne-aviso-icone";
        icone.setAttribute("aria-hidden", "true");
        icone.textContent = erro ? "!" : "✓";

        const mensagem = document.createElement("div");
        mensagem.className = "napne-aviso-texto";
        mensagem.textContent = texto;

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "napne-aviso-fechar";
        botao.setAttribute("aria-label", "Fechar aviso");
        botao.textContent = "×";
        botao.addEventListener("click", function () { fechar(aviso); });

        aviso.appendChild(icone);
        aviso.appendChild(mensagem);
        aviso.appendChild(botao);
        area.appendChild(aviso);

        // Some sozinho; passar o mouse ou o foco pausa a contagem
        const duracao = erro ? 8000 : 5000;
        let temporizador = setTimeout(function () { fechar(aviso); }, duracao);

        aviso.addEventListener("mouseenter", function () { clearTimeout(temporizador); });
        aviso.addEventListener("mouseleave", function () {
            temporizador = setTimeout(function () { fechar(aviso); }, 2500);
        });
    }

    // Substitui o alert() de todo o site
    window.alert = function (mensagem) {

        const texto = String(mensagem ?? "");
        mostrar(texto, PADRAO_SUCESSO.test(texto) ? "sucesso" : "erro");
    };

    window.napneAviso = mostrar;

    // Se a página mudar logo após o aviso (ex.: cadastro -> login), o aviso continua na próxima
    window.addEventListener("pagehide", function () {

        const aviso = document.querySelector("#napne-avisos .napne-aviso:not(.sai)");

        if (aviso) {
            sessionStorage.setItem(CHAVE_PENDENTE, JSON.stringify({
                texto: aviso.dataset.texto,
                tipo: aviso.dataset.tipo,
                hora: Date.now()
            }));
        }
    });

    document.addEventListener("DOMContentLoaded", function () {

        const guardado = sessionStorage.getItem(CHAVE_PENDENTE);

        if (!guardado) {
            return;
        }

        sessionStorage.removeItem(CHAVE_PENDENTE);

        try {
            const aviso = JSON.parse(guardado);

            if (Date.now() - aviso.hora < 6000) {
                mostrar(aviso.texto, aviso.tipo);
            }
        } catch (e) { /* ignora */ }
    });

})();
