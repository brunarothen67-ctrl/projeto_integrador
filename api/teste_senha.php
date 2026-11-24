<?php

require_once __DIR__ . "/../conexao.php";

$email = "napne@rolante.ifrs.edu.br";

// Informe aqui a senha que você definiu no atualizar_senha_admin.php
$senha = "Napne@2026#Acesso";

$stmt = $pdo->prepare(
    "SELECT senha FROM usuarios
     WHERE email = :email AND tipo = 'admin'
     LIMIT 1"
);

$stmt->execute([":email" => $email]);

$usuario = $stmt->fetch();

if (!$usuario) {
    echo "ADMINISTRADOR NÃO ENCONTRADO";
} elseif (password_verify($senha, $usuario["senha"])) {
    echo "SENHA CORRETA";
} else {
    echo "SENHA INCORRETA";
}
