<?php
/*
 * Funções compartilhadas pelas APIs: sessão, respostas JSON e controle de acesso.
 * Os arquivos que começam com "_" não são endpoints.
 */

require_once __DIR__ . "/../conexao.php";

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "httponly" => true,
        "samesite" => "Lax",
        "secure" => !empty($_SERVER["HTTPS"])
    ]);
    session_start();
}

header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("Cache-Control: no-store");

function responder($dados, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function erro(string $mensagem, int $status = 400): void
{
    responder(["erro" => $mensagem], $status);
}

function lerJson(): array
{
    $dados = json_decode(file_get_contents("php://input"), true);

    if (!is_array($dados)) {
        erro("Dados inválidos.");
    }

    return $dados;
}

/**
 * Usuário logado, sempre lido do banco (assim mudança de tipo ou exclusão
 * da conta vale imediatamente). Retorna null se não houver login válido.
 */
function usuarioAtual(): ?array
{
    global $pdo;
    static $cache = false;

    if ($cache !== false) {
        return $cache;
    }

    $id = $_SESSION["usuario_id"] ?? null;

    if (!$id) {
        return $cache = null;
    }

    $stmt = $pdo->prepare(
        "SELECT id, nome, email, tipo, foto_perfil FROM usuarios WHERE id = :id LIMIT 1"
    );
    $stmt->execute([":id" => $id]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        $_SESSION = [];
        return $cache = null;
    }

    $usuario["id"] = (int)$usuario["id"];

    return $cache = $usuario;
}

function exigirLogin(): array
{
    $usuario = usuarioAtual();

    if (!$usuario) {
        erro("Você precisa estar logado.", 401);
    }

    return $usuario;
}

function exigirAdmin(): array
{
    $usuario = exigirLogin();

    if ($usuario["tipo"] !== "admin") {
        erro("Acesso permitido somente ao administrador.", 403);
    }

    return $usuario;
}

/** Valida uma imagem enviada ($_FILES) e devolve ["tmp_name", "extensao"]. */
function validarImagem(array $arquivo, int $tamanhoMaximo): array
{
    if ($arquivo["error"] !== UPLOAD_ERR_OK) {
        if (in_array($arquivo["error"], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
            erro("A imagem é maior do que o permitido.");
        }
        erro("Ocorreu um erro ao enviar a imagem.");
    }

    if ($arquivo["size"] > $tamanhoMaximo) {
        erro("Cada imagem deve ter no máximo " . round($tamanhoMaximo / 1048576) . " MB.");
    }

    $permitidos = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($arquivo["tmp_name"]);

    if (!isset($permitidos[$mime]) || @getimagesize($arquivo["tmp_name"]) === false) {
        erro("Formato de imagem não permitido. Use JPG, PNG ou WebP.");
    }

    return ["tmp_name" => $arquivo["tmp_name"], "extensao" => $permitidos[$mime]];
}

/** Apaga um arquivo de upload, só se o caminho estiver dentro da pasta esperada. */
function apagarUpload(?string $caminhoRelativo, string $prefixo): void
{
    if (!$caminhoRelativo || strpos($caminhoRelativo, $prefixo) !== 0) {
        return;
    }

    $arquivo = __DIR__ . "/../" . $prefixo . basename($caminhoRelativo);

    if (is_file($arquivo)) {
        @unlink($arquivo);
    }
}
