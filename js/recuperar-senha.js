const formulario = document.getElementById("formRecuperacao");

const mensagem = document.getElementById("mensagemRecuperacao");


formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    mensagem.classList.remove("d-none");


    formulario.reset();

});