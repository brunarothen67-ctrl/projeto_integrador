<?php

/*
 * Conteúdos do site: projetos, eventos e materiais.
 *
 *  GET ?tipo=projetos|eventos|materiais   -> lista (público)
 *  PUT {tipo, itens: [...]}               -> substitui a lista (somente administrador)
 */

require_once __DIR__ . "/_comum.php";

const TIPOS_CONTEUDO = ["projetos", "eventos", "materiais"];
const MAX_ITENS = 500;

$metodo = $_SERVER["REQUEST_METHOD"];

try {

    if ($metodo === "GET") {

        $tipo = $_GET["tipo"] ?? "";

        if (!in_array($tipo, TIPOS_CONTEUDO, true)) {
            erro("Tipo de conteúdo inválido.");
        }

        $stmt = $pdo->prepare("SELECT dados FROM conteudos WHERE tipo = :tipo ORDER BY ordem ASC, id ASC");
        $stmt->execute([":tipo" => $tipo]);

        $itens = [];

        foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $json) {
            $item = json_decode($json, true);

            if (is_array($item)) {
                $itens[] = $item;
            }
        }

        responder($itens);
    }

    if ($metodo === "PUT") {

        exigirAdmin();

        if (empty(file_get_contents("php://input")) && (int)($_SERVER["CONTENT_LENGTH"] ?? 0) > 0) {
            erro("Os dados enviados são grandes demais. Use imagens menores.", 413);
        }

        $dados = lerJson();
        $tipo = $dados["tipo"] ?? "";
        $itens = $dados["itens"] ?? null;

        if (!in_array($tipo, TIPOS_CONTEUDO, true) || !is_array($itens) || count($itens) > MAX_ITENS) {
            erro("Dados inválidos.");
        }

        foreach ($itens as $item) {
            if (!is_array($item)) {
                erro("Dados inválidos.");
            }
        }

        $pdo->beginTransaction();

        $pdo->prepare("DELETE FROM conteudos WHERE tipo = :tipo")->execute([":tipo" => $tipo]);

        $inserir = $pdo->prepare("INSERT INTO conteudos (tipo, ordem, dados) VALUES (:tipo, :ordem, :dados)");

        foreach (array_values($itens) as $ordem => $item) {
            $inserir->execute([
                ":tipo" => $tipo,
                ":ordem" => $ordem,
                ":dados" => json_encode($item, JSON_UNESCAPED_UNICODE)
            ]);
        }

        $pdo->commit();

        responder(["sucesso" => true]);
    }

    erro("Método não permitido.", 405);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($e->getMessage());
    erro("Não foi possível salvar os dados.", 500);
}
