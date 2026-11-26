<?php

require_once __DIR__ . "/_comum.php";

$usuario = usuarioAtual();

if (!$usuario) {
    responder(["autenticado" => false, "erro" => "Usuário não autenticado."], 401);
}

responder([
    "autenticado" => true,
    "usuario" => [
        "id" => $usuario["id"],
        "nome" => $usuario["nome"],
        "email" => $usuario["email"],
        "tipo" => $usuario["tipo"],
        "foto_perfil" => $usuario["foto_perfil"]
    ]
]);
