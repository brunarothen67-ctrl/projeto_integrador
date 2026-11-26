<?php

require_once __DIR__ . "/_comum.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    erro("Método não permitido.", 405);
}

$dados = lerJson();

$email = is_string($dados["email"] ?? null) ? strtolower(trim($dados["email"])) : "";
$senha = is_string($dados["senha"] ?? null) ? $dados["senha"] : "";

if ($email === "" || $senha === "") {
    erro("Preencha o e-mail e a senha.");
}

// Limite simples de tentativas erradas em sequência na mesma sessão
$tentativas = $_SESSION["tentativas_login"] ?? ["qtd" => 0, "desde" => time()];

if (time() - $tentativas["desde"] > 300) {
    $tentativas = ["qtd" => 0, "desde" => time()];
}

if ($tentativas["qtd"] >= 10) {
    $_SESSION["tentativas_login"] = $tentativas;
    erro("Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429);
}

try {

    $stmt = $pdo->prepare(
        "SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = :email LIMIT 1"
    );
    $stmt->execute([":email" => $email]);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($senha, $usuario["senha"])) {
        $tentativas["qtd"]++;
        $_SESSION["tentativas_login"] = $tentativas;
        erro("E-mail ou senha inválidos.", 401);
    }

    if (password_needs_rehash($usuario["senha"], PASSWORD_DEFAULT)) {
        $pdo->prepare("UPDATE usuarios SET senha = :s WHERE id = :id")
            ->execute([":s" => password_hash($senha, PASSWORD_DEFAULT), ":id" => $usuario["id"]]);
    }

    session_regenerate_id(true);

    $_SESSION = ["usuario_id" => (int)$usuario["id"]];

    responder([
        "sucesso" => true,
        "usuario" => [
            "nome" => $usuario["nome"],
            "email" => $usuario["email"],
            "tipo" => $usuario["tipo"]
        ]
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());
    erro("Não foi possível realizar o login.", 500);
}
