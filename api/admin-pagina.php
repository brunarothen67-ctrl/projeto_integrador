<?php

/*
 * Entrega as páginas de /admin somente para administradores logados
 * (o .htaccess de /admin redireciona os pedidos para cá).
 */

require_once __DIR__ . "/_comum.php";

$usuario = usuarioAtual();

if (!$usuario) {
    header("Location: /login.html");
    exit;
}

if ($usuario["tipo"] !== "admin") {
    header("Location: /index.html");
    exit;
}

$pagina = $_GET["p"] ?? "";

if (!is_string($pagina) || !preg_match('/^[a-z0-9-]+\.html$/', $pagina)) {
    http_response_code(404);
    exit;
}

$arquivo = __DIR__ . "/../admin/" . $pagina;

if (!is_file($arquivo)) {
    http_response_code(404);
    exit;
}

header("Content-Type: text/html; charset=UTF-8");
header("Cache-Control: no-store");

readfile($arquivo);
