<?php

/*
 * Passo 2 da recuperação de senha: valida o token e grava a nova senha.
 *
 *  GET  ?token=...        -> informa se o token ainda é válido
 *  POST {token, senha}    -> redefine a senha (token de uso único)
 */

require_once __DIR__ . "/_comum.php";

function buscarTokenValido(PDO $pdo, string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }

    $stmt = $pdo->prepare(
        "SELECT id, usuario_id FROM recuperacao_senha
         WHERE token_hash = :hash AND usado_em IS NULL AND expira_em > NOW()
         LIMIT 1"
    );
    $stmt->execute([":hash" => hash("sha256", $token)]);

    return $stmt->fetch() ?: null;
}

try {

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $token = is_string($_GET["token"] ?? null) ? $_GET["token"] : "";

        if (!buscarTokenValido($pdo, $token)) {
            erro("Este link é inválido ou expirou. Solicite um novo.", 400);
        }

        responder(["sucesso" => true]);
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        erro("Método não permitido.", 405);
    }

    $dados = lerJson();
    $token = is_string($dados["token"] ?? null) ? $dados["token"] : "";
    $senha = is_string($dados["senha"] ?? null) ? $dados["senha"] : "";

    if (strlen($senha) < 6 || strlen($senha) > 72) {
        erro("A senha deve ter entre 6 e 72 caracteres.");
    }

    $pdo->beginTransaction();

    // Marca o token como usado de forma atômica: só uma requisição consegue
    $stmt = $pdo->prepare(
        "UPDATE recuperacao_senha SET usado_em = NOW()
         WHERE token_hash = :hash AND usado_em IS NULL AND expira_em > NOW()"
    );
    $stmt->execute([":hash" => hash("sha256", $token)]);

    if ($stmt->rowCount() !== 1 || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        $pdo->rollBack();
        erro("Este link é inválido ou expirou. Solicite um novo.", 400);
    }

    $stmt = $pdo->prepare("SELECT usuario_id FROM recuperacao_senha WHERE token_hash = :hash");
    $stmt->execute([":hash" => hash("sha256", $token)]);
    $usuarioId = (int)$stmt->fetchColumn();

    $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id")
        ->execute([":senha" => password_hash($senha, PASSWORD_DEFAULT), ":id" => $usuarioId]);

    // Qualquer outro link pendente dessa conta deixa de valer
    $pdo->prepare(
        "UPDATE recuperacao_senha SET usado_em = NOW() WHERE usuario_id = :id AND usado_em IS NULL"
    )->execute([":id" => $usuarioId]);

    $pdo->commit();

    responder(["sucesso" => true, "mensagem" => "Senha redefinida com sucesso! Faça login com a nova senha."]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($e->getMessage());
    erro("Não foi possível redefinir a senha.", 500);
}
