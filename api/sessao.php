<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

if (isset($_SESSION["usuario"])) {

    echo json_encode([
        "autenticado" => true,
        "usuario" => $_SESSION["usuario"]
    ]);

} else {

    http_response_code(401);

    echo json_encode([
        "autenticado" => false,
        "erro" => "Usuário não autenticado."
    ]);
}