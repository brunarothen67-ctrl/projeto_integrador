<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    echo json_encode(["erro" => "Você precisa estar logado."]);
    exit;
}

$id = $_SESSION["usuario"]["id"];

try {

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $stmt = $pdo->prepare(
            "SELECT nome, email FROM usuarios WHERE id = :id"
        );

        $stmt->execute([":id" => $id]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            http_response_code(404);
            echo json_encode(["erro" => "Usuário não encontrado."]);
            exit;
        }

        echo json_encode([
            "sucesso" => true,
            "usuario" => $usuario
        ]);
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);
        echo json_encode(["erro" => "Método não permitido."]);
        exit;
    }

    $dados = json_decode(file_get_contents("php://input"), true);

    if (!is_array($dados)) {
        http_response_code(400);
        echo json_encode(["erro" => "Dados inválidos."]);
        exit;
    }

    $nome = trim($dados["nome"] ?? "");
    $email = strtolower(trim($dados["email"] ?? ""));
    $novaSenha = $dados["novaSenha"] ?? "";

    if ($nome === "" || $email === "") {
        http_response_code(400);
        echo json_encode(["erro" => "Preencha nome e e-mail."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["erro" => "E-mail inválido."]);
        exit;
    }

    if (!is_string($novaSenha) || ($novaSenha !== "" && strlen($novaSenha) < 6)) {
        http_response_code(400);
        echo json_encode(["erro" => "A senha deve ter pelo menos 6 caracteres."]);
        exit;
    }

    $stmt = $pdo->prepare(
        "SELECT id FROM usuarios
         WHERE email = :email AND id != :id
         LIMIT 1"
    );

    $stmt->execute([
        ":email" => $email,
        ":id" => $id
    ]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["erro" => "Este e-mail já está cadastrado."]);
        exit;
    }

    if ($novaSenha !== "") {

        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare(
            "UPDATE usuarios
             SET nome = :nome, email = :email, senha = :senha
             WHERE id = :id"
        );

        $stmt->execute([
            ":nome" => $nome,
            ":email" => $email,
            ":senha" => $senhaHash,
            ":id" => $id
        ]);

    } else {

        $stmt = $pdo->prepare(
            "UPDATE usuarios
             SET nome = :nome, email = :email
             WHERE id = :id"
        );

        $stmt->execute([
            ":nome" => $nome,
            ":email" => $email,
            ":id" => $id
        ]);
    }

    $_SESSION["usuario"]["nome"] = $nome;
    $_SESSION["usuario"]["email"] = $email;

    echo json_encode([
        "sucesso" => true,
        "usuario" => $_SESSION["usuario"],
        "mensagem" => "Perfil atualizado com sucesso!"
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);
    echo json_encode(["erro" => "Não foi possível processar o perfil."]);
}
