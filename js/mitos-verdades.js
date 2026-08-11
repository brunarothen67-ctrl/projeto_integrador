/* =========================================================
   MITOS E VERDADES
   NAPNE - IFRS Campus Rolante
========================================================= */

const perguntasMitos = [

    {
        pergunta: "Só quem tem laudo pode procurar o NAPNE.",
        resposta: false,
        explicacao: "Mito! O laudo não é obrigatório para que o estudante seja acolhido pelo NAPNE. O núcleo considera as necessidades educacionais apresentadas pelo estudante."
    },

    {
        pergunta: "O NAPNE é apenas para estudantes com deficiência.",
        resposta: false,
        explicacao: "Mito! O NAPNE atende diferentes necessidades educacionais específicas e promove ações de acessibilidade e inclusão."
    },

    {
        pergunta: "As adaptações facilitam o conteúdo para o estudante.",
        resposta: false,
        explicacao: "Mito! As estratégias de acessibilidade buscam possibilitar a participação e a aprendizagem, sem simplesmente diminuir as exigências educacionais."
    },

    {
        pergunta: "Inclusão significa diminuir o nível de exigência.",
        resposta: false,
        explicacao: "Mito! Inclusão significa promover condições de acesso, participação e aprendizagem, respeitando as necessidades de cada estudante."
    },

    {
        pergunta: "O NAPNE resolve sozinho todas as questões relacionadas à inclusão.",
        resposta: false,
        explicacao: "Mito! A inclusão é responsabilidade de toda a comunidade acadêmica. O NAPNE atua em articulação com docentes, setores da instituição, famílias e estudantes."
    }

];


let perguntaAtual = 0;
let acertos = 0;


/* =========================================================
   MOSTRAR PERGUNTA
========================================================= */

function mostrarPergunta() {

    const pergunta = perguntasMitos[perguntaAtual];

    document.getElementById("tituloMito").textContent =
        `Pergunta ${perguntaAtual + 1} de ${perguntasMitos.length}`;

    document.getElementById("perguntaMito").textContent =
        pergunta.pergunta;

    document.getElementById("resultadoMito").innerHTML = "";

    document.getElementById("opcoesMito").style.display = "block";

    document.getElementById("proximoMito").style.display = "none";
}


/* =========================================================
   RESPONDER
========================================================= */

function responderMito(resposta) {

    const pergunta = perguntasMitos[perguntaAtual];

    const resultado = document.getElementById("resultadoMito");

    const acertou = resposta === pergunta.resposta;

    if (acertou) {

        acertos++;

        resultado.innerHTML = `
            <div class="alert alert-success">
                <strong>Você acertou! ✓</strong><br>
                ${pergunta.explicacao}
            </div>
        `;

    } else {

        resultado.innerHTML = `
            <div class="alert alert-danger">
                <strong>Você errou! ✗</strong><br>
                ${pergunta.explicacao}
            </div>
        `;

    }

    document.getElementById("opcoesMito").style.display = "none";

    document.getElementById("proximoMito").style.display = "inline-block";
}


/* =========================================================
   PRÓXIMA PERGUNTA
========================================================= */

function proximaPergunta() {

    perguntaAtual++;

    if (perguntaAtual < perguntasMitos.length) {

        mostrarPergunta();

    } else {

        mostrarResultadoFinal();

    }
}


/* =========================================================
   RESULTADO FINAL
========================================================= */

function mostrarResultadoFinal() {

    document.getElementById("tituloMito").textContent =
        "Quiz concluído!";

    document.getElementById("perguntaMito").innerHTML = `
        Você acertou <strong>${acertos}</strong>
        de <strong>${perguntasMitos.length}</strong> perguntas.
    `;

    document.getElementById("opcoesMito").style.display = "none";

    document.getElementById("proximoMito").style.display = "inline-block";

    document.getElementById("proximoMito").innerHTML = `
        Refazer quiz
        <i class="bi bi-arrow-clockwise"></i>
    `;

    document.getElementById("resultadoMito").innerHTML = `
        <div class="alert alert-info">
            Continue aprendendo sobre inclusão,
            acessibilidade e o trabalho do NAPNE!
        </div>
    `;

    document.getElementById("proximoMito").onclick = reiniciarQuiz;
}


/* =========================================================
   REINICIAR
========================================================= */

function reiniciarQuiz() {

    perguntaAtual = 0;
    acertos = 0;

    document.getElementById("proximoMito").onclick =
        proximaPergunta;

    mostrarPergunta();
}


/* =========================================================
   INICIAR QUIZ
========================================================= */

document.addEventListener("DOMContentLoaded", function() {

    mostrarPergunta();

});