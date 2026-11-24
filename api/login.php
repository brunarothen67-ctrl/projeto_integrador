<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

// Receber os dados enviados pelo JavaScript
$dados = json_decode(file_get_contents("php://input"), true);

$email = strtolower(trim($dados["email"] ?? ""));
$senha = $dados["senha"] ?? "";

// Validar campos
if (empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(["erro" => "Preencha o e-mail e a senha."]);
    exit;
}

try {

    // Buscar usuário no banco
    $sql = "SELECT id, nome, email, senha, tipo
            FROM usuarios
            WHERE email = :email
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":email" => $email]);

    $usuario = $stmt->fetch();


    

    // Verificar usuário e senha
    if (!$usuario || !password_verify($senha, $usuario["senha"])) {
        http_response_code(401);
        echo json_encode([
            "erro" => "E-mail ou senha inválidos."
        ]);
        exit;
    }

    // Verificar tipo de conta
    if (!in_array($usuario["tipo"], ["admin", "usuario"], true)) {
        http_response_code(403);
        echo json_encode(["erro" => "Tipo de conta inválido."]);
        exit;
    }

    // Criar sessão
    session_regenerate_id(true);

    $_SESSION["usuario"] = [
        "id" => $usuario["id"],
        "nome" => $usuario["nome"],
        "email" => $usuario["email"],
        "tipo" => $usuario["tipo"]
    ];

    // Retornar dados para o JavaScript
    echo json_encode([
        "sucesso" => true,
        "usuario" => [
            "nome" => $usuario["nome"],
            "email" => $usuario["email"],
            "tipo" => $usuario["tipo"]
        ]
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);
    echo json_encode([
        "erro" => "Não foi possível realizar o login."
    ]);
}
