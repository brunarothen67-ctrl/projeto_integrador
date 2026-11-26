<?php

/*
 * API de relatos
 *
 *  GET                 -> relatos publicados (público)
 *  GET  ?meus=1        -> relatos do usuário logado (qualquer status)
 *  GET  ?admin=1       -> todos os relatos (somente administrador)
 *  POST                -> cria relato (usuário logado, multipart)
 *  POST com "id"       -> edita o PRÓPRIO relato; volta para "pendente"
 *  PATCH  {id,status}  -> altera o status (somente administrador)
 *  DELETE {id}         -> exclui (dono do relato ou administrador)
 */

require_once __DIR__ . "/_comum.php";

const PASTA_RELATOS = "uploads/relatos/";
const MAX_IMAGENS = 5;
const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024;
const TIPOS_RELATO = ["Experiência", "Dica", "Conquista", "Dúvida", "Agradecimento"];

$metodo = $_SERVER["REQUEST_METHOD"];
$diretorioImagens = __DIR__ . "/../" . PASTA_RELATOS;

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function buscarImagens(PDO $pdo, array $ids): array
{
    if (empty($ids)) {
        return [];
    }

    $marcadores = implode(",", array_fill(0, count($ids), "?"));

    $stmt = $pdo->prepare(
        "SELECT relato_id, caminho FROM relato_imagens
         WHERE relato_id IN ($marcadores) ORDER BY id ASC"
    );
    $stmt->execute($ids);

    $mapa = [];

    foreach ($stmt->fetchAll() as $linha) {
        $mapa[(int)$linha["relato_id"]][] = $linha["caminho"];
    }

    return $mapa;
}

function textoLimpo($valor): string
{
    return is_string($valor) ? trim($valor) : "";
}

/** Valida e devolve título, tipo, texto, sentimento e anonimato do formulário. */
function lerCamposRelato(): array
{
    $titulo = textoLimpo($_POST["titulo"] ?? "");
    $tipo = textoLimpo($_POST["tipo"] ?? "");
    $texto = textoLimpo($_POST["texto"] ?? "");
    $sentimento = textoLimpo($_POST["sentimento"] ?? "");

    if ($titulo === "" || $tipo === "" || $texto === "") {
        erro("Preencha os campos obrigatórios.");
    }

    if (mb_strlen($titulo) > 180) {
        erro("O título deve ter no máximo 180 caracteres.");
    }

    if (!in_array($tipo, TIPOS_RELATO, true)) {
        erro("Tipo de relato inválido.");
    }

    if (mb_strlen($texto) > 5000) {
        erro("O relato deve ter no máximo 5000 caracteres.");
    }

    if (mb_strlen($sentimento) > 50) {
        erro("Sentimento inválido.");
    }

    return [
        "titulo" => $titulo,
        "tipo" => $tipo,
        "texto" => $texto,
        "sentimento" => $sentimento !== "" ? $sentimento : null,
        "anonimo" => !empty($_POST["anonimo"]) && $_POST["anonimo"] !== "0" ? 1 : 0
    ];
}

/** Valida as imagens enviadas em "fotos[]" e devolve a lista pronta para salvar. */
function lerImagensEnviadas(): array
{
    if (!isset($_FILES["fotos"])) {
        return [];
    }

    $fotos = $_FILES["fotos"];

    if (!is_array($fotos["name"])) {
        erro("Formato de envio das imagens inválido.");
    }

    $validas = [];

    foreach ($fotos["name"] as $i => $nome) {

        if ($fotos["error"][$i] === UPLOAD_ERR_NO_FILE) {
            continue;
        }

        $validas[] = validarImagem([
            "error" => $fotos["error"][$i],
            "size" => $fotos["size"][$i],
            "tmp_name" => $fotos["tmp_name"][$i]
        ], TAMANHO_MAX_IMAGEM);
    }

    return $validas;
}

function prepararPasta(string $diretorio): void
{
    if (!is_dir($diretorio) && !mkdir($diretorio, 0755, true)) {
        erro("Não foi possível preparar o armazenamento das imagens.", 500);
    }
}

// Arquivo maior que post_max_size: o PHP descarta $_POST e $_FILES
if ($metodo === "POST" && empty($_POST) && empty($_FILES) && (int)($_SERVER["CONTENT_LENGTH"] ?? 0) > 0) {
    erro("O envio é grande demais. Reduza o tamanho das imagens.", 413);
}

// =====================================================
// CONSULTAR
// =====================================================

if ($metodo === "GET") {

    try {

        $admin = !empty($_GET["admin"]);
        $meus = !empty($_GET["meus"]);

        $colunas = "r.id, r.titulo, r.tipo, r.texto, r.sentimento, r.anonimo,
                    r.status, r.criado_em, r.atualizado_em";

        if ($admin) {

            exigirAdmin();

            $sql = "SELECT $colunas, u.nome AS nome, u.email AS autor_email, u.foto_perfil
                    FROM relatos r
                    LEFT JOIN usuarios u ON u.id = r.usuario_id
                    ORDER BY r.criado_em DESC";
            $stmt = $pdo->query($sql);

        } elseif ($meus) {

            $usuario = exigirLogin();

            $sql = "SELECT $colunas, u.nome AS nome, u.foto_perfil
                    FROM relatos r
                    LEFT JOIN usuarios u ON u.id = r.usuario_id
                    WHERE r.usuario_id = :id
                    ORDER BY r.criado_em DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([":id" => $usuario["id"]]);

        } else {

            // Público: só publicados; autores anônimos não têm nome nem foto expostos
            $sql = "SELECT $colunas,
                           IF(r.anonimo = 1, NULL, COALESCE(u.nome, r.nome)) AS nome,
                           IF(r.anonimo = 1, NULL, u.foto_perfil) AS foto_perfil
                    FROM relatos r
                    LEFT JOIN usuarios u ON u.id = r.usuario_id
                    WHERE r.status = 'publicado'
                    ORDER BY r.criado_em DESC";
            $stmt = $pdo->query($sql);

        }

        $relatos = $stmt->fetchAll();
        $imagens = buscarImagens($pdo, array_column($relatos, "id"));

        foreach ($relatos as &$relato) {
            $relato["imagens"] = $imagens[(int)$relato["id"]] ?? [];
        }

        unset($relato);

        responder($relatos);

    } catch (PDOException $e) {

        error_log($e->getMessage());
        erro("Não foi possível consultar os relatos.", 500);

    }

}

// =====================================================
// CRIAR OU EDITAR
// =====================================================

if ($metodo === "POST") {

    $usuario = exigirLogin();

    $editandoId = filter_var($_POST["id"] ?? null, FILTER_VALIDATE_INT);
    $campos = lerCamposRelato();
    $novasImagens = lerImagensEnviadas();

    $remover = [];

    if ($editandoId) {

        $stmt = $pdo->prepare("SELECT id, usuario_id FROM relatos WHERE id = :id");
        $stmt->execute([":id" => $editandoId]);
        $existente = $stmt->fetch();

        // Cada usuário só altera os próprios relatos
        if (!$existente || (int)$existente["usuario_id"] !== $usuario["id"]) {
            erro("Relato não encontrado.", 404);
        }

        $remover = isset($_POST["remover"]) && is_array($_POST["remover"])
            ? array_values(array_filter($_POST["remover"], "is_string"))
            : [];

        $atuais = buscarImagens($pdo, [$editandoId])[$editandoId] ?? [];
        $remover = array_values(array_intersect($remover, $atuais));
        $restantes = count($atuais) - count($remover);

    } else {

        $restantes = 0;

    }

    if ($restantes + count($novasImagens) > MAX_IMAGENS) {
        erro("Cada relato pode ter no máximo " . MAX_IMAGENS . " imagens.");
    }

    prepararPasta($diretorioImagens);

    $arquivosSalvos = [];

    try {

        $pdo->beginTransaction();

        if ($editandoId) {

            // Relato editado volta para análise do administrador
            $stmt = $pdo->prepare(
                "UPDATE relatos
                 SET titulo = :titulo, tipo = :tipo, texto = :texto, sentimento = :sentimento,
                     anonimo = :anonimo, nome = :nome, status = 'pendente', atualizado_em = NOW()
                 WHERE id = :id AND usuario_id = :usuario"
            );

            $stmt->execute([
                ":titulo" => $campos["titulo"],
                ":tipo" => $campos["tipo"],
                ":texto" => $campos["texto"],
                ":sentimento" => $campos["sentimento"],
                ":anonimo" => $campos["anonimo"],
                ":nome" => $usuario["nome"],
                ":id" => $editandoId,
                ":usuario" => $usuario["id"]
            ]);

            $relatoId = $editandoId;

            $apagar = $pdo->prepare(
                "DELETE FROM relato_imagens WHERE relato_id = :r AND caminho = :c"
            );

            foreach ($remover as $caminho) {
                $apagar->execute([":r" => $relatoId, ":c" => $caminho]);
            }

        } else {

            $stmt = $pdo->prepare(
                "INSERT INTO relatos
                    (usuario_id, titulo, tipo, texto, sentimento, anonimo, nome, status)
                 VALUES
                    (:usuario, :titulo, :tipo, :texto, :sentimento, :anonimo, :nome, 'pendente')"
            );

            $stmt->execute([
                ":usuario" => $usuario["id"],
                ":titulo" => $campos["titulo"],
                ":tipo" => $campos["tipo"],
                ":texto" => $campos["texto"],
                ":sentimento" => $campos["sentimento"],
                ":anonimo" => $campos["anonimo"],
                ":nome" => $usuario["nome"]
            ]);

            $relatoId = (int)$pdo->lastInsertId();

        }

        $stmtImagem = $pdo->prepare(
            "INSERT INTO relato_imagens (relato_id, caminho) VALUES (:relato_id, :caminho)"
        );

        foreach ($novasImagens as $imagem) {

            $nomeArquivo = bin2hex(random_bytes(16)) . "." . $imagem["extensao"];
            $destino = $diretorioImagens . $nomeArquivo;

            if (!move_uploaded_file($imagem["tmp_name"], $destino)) {
                throw new RuntimeException("Não foi possível salvar uma das imagens.");
            }

            $arquivosSalvos[] = $destino;

            $stmtImagem->execute([
                ":relato_id" => $relatoId,
                ":caminho" => PASTA_RELATOS . $nomeArquivo
            ]);
        }

        $pdo->commit();

        // Só apaga os arquivos antigos depois de confirmar no banco
        foreach ($remover as $caminho) {
            apagarUpload($caminho, PASTA_RELATOS);
        }

        responder([
            "sucesso" => true,
            "mensagem" => $editandoId
                ? "Relato atualizado e enviado novamente para análise."
                : "Relato enviado para análise."
        ]);

    } catch (Throwable $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        foreach ($arquivosSalvos as $arquivo) {
            if (is_file($arquivo)) {
                unlink($arquivo);
            }
        }

        error_log($e->getMessage());
        erro("Não foi possível salvar o relato e suas imagens.", 500);

    }

}

// =====================================================
// ALTERAR STATUS (ADMIN)
// =====================================================

if ($metodo === "PATCH") {

    exigirAdmin();

    $dados = lerJson();
    $id = filter_var($dados["id"] ?? null, FILTER_VALIDATE_INT);
    $status = $dados["status"] ?? "publicado";

    if (!$id) {
        erro("Relato inválido.");
    }

    if (!in_array($status, ["publicado", "pendente", "reprovado"], true)) {
        erro("Status inválido.");
    }

    try {

        $stmt = $pdo->prepare("UPDATE relatos SET status = :status WHERE id = :id");
        $stmt->execute([":status" => $status, ":id" => $id]);

        $mensagens = [
            "publicado" => "Relato publicado com sucesso.",
            "reprovado" => "Relato reprovado.",
            "pendente" => "Relato devolvido para análise."
        ];

        responder(["sucesso" => true, "mensagem" => $mensagens[$status]]);

    } catch (PDOException $e) {

        error_log($e->getMessage());
        erro("Não foi possível atualizar o relato.", 500);

    }

}

// =====================================================
// EXCLUIR (DONO OU ADMIN)
// =====================================================

if ($metodo === "DELETE") {

    $usuario = exigirLogin();

    $dados = lerJson();
    $id = filter_var($dados["id"] ?? null, FILTER_VALIDATE_INT);

    if (!$id) {
        erro("Relato inválido.");
    }

    try {

        $stmt = $pdo->prepare("SELECT usuario_id FROM relatos WHERE id = :id");
        $stmt->execute([":id" => $id]);
        $relato = $stmt->fetch();

        if (!$relato) {
            erro("Relato não encontrado.", 404);
        }

        if ($usuario["tipo"] !== "admin" && (int)$relato["usuario_id"] !== $usuario["id"]) {
            erro("Você só pode excluir os seus próprios relatos.", 403);
        }

        $imagens = buscarImagens($pdo, [$id])[$id] ?? [];

        $pdo->prepare("DELETE FROM relatos WHERE id = :id")->execute([":id" => $id]);

        foreach ($imagens as $caminho) {
            apagarUpload($caminho, PASTA_RELATOS);
        }

        responder(["sucesso" => true, "mensagem" => "Relato excluído."]);

    } catch (PDOException $e) {

        error_log($e->getMessage());
        erro("Não foi possível excluir o relato.", 500);

    }

}

erro("Método não permitido.", 405);
