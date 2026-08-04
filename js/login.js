const formulario = document.getElementById("formLogin");


formulario.addEventListener("submit", function(event){

    event.preventDefault();


    const email = document.getElementById("email").value;

    const senha = document.getElementById("senha").value;



    if(email === "admin@napne.com" && senha === "123456"){

        window.location.href = "admin/painel-admin.html";

    } else {

        alert("E-mail ou senha inválidos.");

    }


});