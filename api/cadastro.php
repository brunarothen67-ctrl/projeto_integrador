<?php

require_once __DIR__ . "/_comum.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    erro("Método não permitido.", 405);
}

$dados = lerJson();

$nome = is_string($dados["nome"] ?? null) ? trim($dados["nome"]) : "";
$email = is_string($dados["email"] ?? null) ? strtolower(trim($dados["email"])) : "";
$senha = is_string($dados["senha"] ?? null) ? $dados["senha"] : "";

// O tipo da conta NUNCA vem do cliente: todo cadastro é "usuario".

if ($nome === "" || $email === "" || $senha === "") {
    erro("Preencha todos os campos.");
}

if (mb_strlen($nome) < 2 || mb_strlen($nome) > 150) {
    erro("O nome deve ter entre 2 e 150 caracteres.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
    erro("E-mail inválido.");
}

if (strlen($senha) < 6) {
    erro("A senha deve ter pelo menos 6 caracteres.");
}

if (strlen($senha) > 72) {
    erro("A senha deve ter no máximo 72 caracteres.");
}

try {

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);

    if ($stmt->fetch()) {
        erro("Este e-mail já está cadastrado.", 409);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO usuarios (nome, email, senha, tipo)
         VALUES (:nome, :email, :senha, 'usuario')"
    );

    $stmt->execute([
        ":nome" => $nome,
        ":email" => $email,
        ":senha" => password_hash($senha, PASSWORD_DEFAULT)
    ]);

    responder(["sucesso" => true, "mensagem" => "Cadastro realizado com sucesso!"]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    // 23000 = chave única (e-mail cadastrado ao mesmo tempo por outra pessoa)
    if ($e->getCode() === "23000") {
        erro("Este e-mail já está cadastrado.", 409);
    }

    erro("Não foi possível realizar o cadastro.", 500);
}
