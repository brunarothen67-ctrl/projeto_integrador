<?php

/*
 * Passo 1 da recuperação de senha: o usuário informa o e-mail.
 * A resposta é SEMPRE a mesma (exista a conta ou não), para não revelar
 * quais e-mails estão cadastrados.
 */

require_once __DIR__ . "/_comum.php";
require_once __DIR__ . "/_email.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    erro("Método não permitido.", 405);
}

const VALIDADE_MINUTOS = 30;

$dados = lerJson();
$email = is_string($dados["email"] ?? null) ? strtolower(trim($dados["email"])) : "";

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    erro("Informe um e-mail válido.");
}

$resposta = [
    "sucesso" => true,
    "mensagem" => "Se existir uma conta vinculada a esse e-mail, enviamos um link para redefinir a senha."
];

try {

    $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        responder($resposta);
    }

    // Limite: um pedido por minuto para cada conta (evita spam de e-mails)
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM recuperacao_senha
         WHERE usuario_id = :id AND criado_em > (NOW() - INTERVAL 1 MINUTE)"
    );
    $stmt->execute([":id" => $usuario["id"]]);

    if ((int)$stmt->fetchColumn() > 0) {
        responder($resposta);
    }

    // Invalida pedidos anteriores ainda não usados
    $pdo->prepare(
        "UPDATE recuperacao_senha SET usado_em = NOW()
         WHERE usuario_id = :id AND usado_em IS NULL"
    )->execute([":id" => $usuario["id"]]);

    // O token vai por e-mail; no banco fica só o hash dele
    $token = bin2hex(random_bytes(32));

    $pdo->prepare(
        "INSERT INTO recuperacao_senha (usuario_id, token_hash, expira_em)
         VALUES (:id, :hash, DATE_ADD(NOW(), INTERVAL " . VALIDADE_MINUTOS . " MINUTE))"
    )->execute([":id" => $usuario["id"], ":hash" => hash("sha256", $token)]);

    $config = configuracaoEmail();
    $base = rtrim($config["url_site"] ?? (
        (!empty($_SERVER["HTTPS"]) ? "https://" : "http://") . ($_SERVER["HTTP_HOST"] ?? "localhost")
    ), "/");

    $link = $base . "/redefinir-senha.html?token=" . $token;
    $nome = htmlspecialchars($usuario["nome"], ENT_QUOTES, "UTF-8");
    $minutos = VALIDADE_MINUTOS;

    $html = "<p>Olá, {$nome}!</p>"
        . "<p>Recebemos um pedido para redefinir a senha da sua conta no site do NAPNE.</p>"
        . "<p><a href=\"{$link}\">Clique aqui para criar uma nova senha</a></p>"
        . "<p>O link vale por {$minutos} minutos e só pode ser usado uma vez.</p>"
        . "<p>Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.</p>";

    $texto = "Olá, {$usuario['nome']}!\n\n"
        . "Recebemos um pedido para redefinir a senha da sua conta no site do NAPNE.\n"
        . "Acesse o link abaixo para criar uma nova senha:\n\n{$link}\n\n"
        . "O link vale por {$minutos} minutos e só pode ser usado uma vez.\n"
        . "Se você não fez esse pedido, ignore este e-mail.";

    try {

        enviarEmail($email, "Redefinição de senha - NAPNE", $html, $texto);

    } catch (Throwable $e) {

        // Não revela o problema ao visitante; fica no log do servidor
        error_log("Falha ao enviar e-mail de recuperação: " . $e->getMessage());
    }

    responder($resposta);

} catch (PDOException $e) {

    error_log($e->getMessage());
    erro("Não foi possível processar a solicitação.", 500);
}
