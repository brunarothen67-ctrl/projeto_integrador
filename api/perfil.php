<?php

/*
 * API do perfil do usuário logado (cada pessoa só enxerga e altera o próprio perfil).
 *
 *  GET                  -> dados do perfil
 *  POST (multipart)     -> campo "foto": troca a foto de perfil
 *  POST (JSON)          -> {nome, email, novaSenha?}: atualiza os dados
 */

require_once __DIR__ . "/_comum.php";

const PASTA_PERFIS = "uploads/perfis/";

$usuarioLogado = exigirLogin();
$id = $usuarioLogado["id"];

try {

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        responder([
            "sucesso" => true,
            "usuario" => [
                "nome" => $usuarioLogado["nome"],
                "email" => $usuarioLogado["email"],
                "foto_perfil" => $usuarioLogado["foto_perfil"]
            ]
        ]);
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        erro("Método não permitido.", 405);
    }

    // Arquivo maior que post_max_size: o PHP descarta $_POST e $_FILES
    if (empty($_POST) && empty($_FILES) && stripos($_SERVER["CONTENT_TYPE"] ?? "", "multipart/") === 0) {
        erro("A imagem é grande demais. Use uma imagem de até 2 MB.", 413);
    }

    // =====================================================
    // FOTO DE PERFIL
    // =====================================================

    if (isset($_FILES["foto"])) {

        $imagem = validarImagem($_FILES["foto"], 2 * 1024 * 1024);

        $pasta = __DIR__ . "/../" . PASTA_PERFIS;

        if (!is_dir($pasta) && !mkdir($pasta, 0755, true)) {
            throw new RuntimeException("Não foi possível criar a pasta de imagens.");
        }

        $nomeArquivo = "perfil_" . $id . "_" . bin2hex(random_bytes(8)) . "." . $imagem["extensao"];

        if (!move_uploaded_file($imagem["tmp_name"], $pasta . $nomeArquivo)) {
            throw new RuntimeException("Não foi possível salvar a imagem no servidor.");
        }

        $caminhoBanco = PASTA_PERFIS . $nomeArquivo;

        try {

            $pdo->prepare("UPDATE usuarios SET foto_perfil = :foto WHERE id = :id")
                ->execute([":foto" => $caminhoBanco, ":id" => $id]);

        } catch (Throwable $e) {

            @unlink($pasta . $nomeArquivo);
            throw $e;
        }

        // Remove a foto anterior
        apagarUpload($usuarioLogado["foto_perfil"], PASTA_PERFIS);

        responder([
            "sucesso" => true,
            "foto_perfil" => $caminhoBanco,
            "mensagem" => "Foto de perfil atualizada com sucesso!"
        ]);
    }

    // =====================================================
    // NOME, E-MAIL E SENHA
    // =====================================================

    $dados = lerJson();

    $nome = is_string($dados["nome"] ?? null) ? trim($dados["nome"]) : "";
    $email = is_string($dados["email"] ?? null) ? strtolower(trim($dados["email"])) : "";
    $novaSenha = $dados["novaSenha"] ?? "";

    if ($nome === "" || $email === "") {
        erro("Preencha nome e e-mail.");
    }

    if (mb_strlen($nome) < 2 || mb_strlen($nome) > 150) {
        erro("O nome deve ter entre 2 e 150 caracteres.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        erro("E-mail inválido.");
    }

    if (!is_string($novaSenha) || ($novaSenha !== "" && (strlen($novaSenha) < 6 || strlen($novaSenha) > 72))) {
        erro("A senha deve ter entre 6 e 72 caracteres.");
    }

    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email AND id != :id LIMIT 1");
    $stmt->execute([":email" => $email, ":id" => $id]);

    if ($stmt->fetch()) {
        erro("Este e-mail já está cadastrado.", 409);
    }

    if ($novaSenha !== "") {

        $pdo->prepare(
            "UPDATE usuarios SET nome = :nome, email = :email, senha = :senha WHERE id = :id"
        )->execute([
            ":nome" => $nome,
            ":email" => $email,
            ":senha" => password_hash($novaSenha, PASSWORD_DEFAULT),
            ":id" => $id
        ]);

    } else {

        $pdo->prepare(
            "UPDATE usuarios SET nome = :nome, email = :email WHERE id = :id"
        )->execute([":nome" => $nome, ":email" => $email, ":id" => $id]);
    }

    responder([
        "sucesso" => true,
        "usuario" => ["nome" => $nome, "email" => $email, "tipo" => $usuarioLogado["tipo"]],
        "mensagem" => "Perfil atualizado com sucesso!"
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    if ($e->getCode() === "23000") {
        erro("Este e-mail já está cadastrado.", 409);
    }

    erro("Não foi possível processar a solicitação.", 500);

} catch (Throwable $e) {

    error_log($e->getMessage());
    erro("Não foi possível processar a solicitação.", 500);
}
