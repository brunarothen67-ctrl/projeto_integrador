<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

$dados = json_decode(file_get_contents("php://input"), true);

if (!$dados) {
    http_response_code(400);
    echo json_encode(["erro" => "Dados inválidos."]);
    exit;
}

$nome = trim($dados["nome"] ?? "");
$email = strtolower(trim($dados["email"] ?? ""));
$senha = $dados["senha"] ?? "";

// Validar campos
if (empty($nome) || empty($email) || empty($senha)) {
    http_response_code(400);
    echo json_encode(["erro" => "Preencha todos os campos."]);
    exit;
}

// Validar e-mail
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["erro" => "E-mail inválido."]);
    exit;
}

// Validar senha
if (strlen($senha) < 6) {
    http_response_code(400);
    echo json_encode(["erro" => "A senha deve ter pelo menos 6 caracteres."]);
    exit;
}

try {

    // Verificar se o e-mail já está cadastrado
    $sql = "SELECT id FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":email" => $email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["erro" => "Este e-mail já está cadastrado."]);
        exit;
    }

    // Proteger a senha
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    // Cadastrar usuário no banco de dados
    $sql = "INSERT INTO usuarios (nome, email, senha, tipo)
            VALUES (:nome, :email, :senha, 'usuario')";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":nome" => $nome,
        ":email" => $email,
        ":senha" => $senhaHash
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Cadastro realizado com sucesso!"
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);
    echo json_encode([
        "erro" => "Não foi possível realizar o cadastro."
    ]);
}
