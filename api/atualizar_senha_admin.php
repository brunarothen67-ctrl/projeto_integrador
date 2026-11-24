<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

$email = "napne@rolante.ifrs.edu.br";
$senha = "Napne@2026#Acesso";

try {

    // Gerar hash da nova senha
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    // Atualizar administrador
    $sql = "UPDATE usuarios
            SET senha = :senha
            WHERE email = :email
            AND tipo = 'admin'";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":senha" => $senhaHash,
        ":email" => $email
    ]);

    // Buscar novamente a senha gravada
    $consulta = $pdo->prepare(
        "SELECT senha FROM usuarios
         WHERE email = :email AND tipo = 'admin'
         LIMIT 1"
    );

    $consulta->execute([":email" => $email]);
    $hashGravado = $consulta->fetchColumn();

    if ($hashGravado && password_verify($senha, $hashGravado)) {

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Senha atualizada e validada!"
        ]);

    } else {

        http_response_code(500);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "A senha não foi validada após a atualização."
        ]);
    }

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao atualizar a senha."
    ]);
}
