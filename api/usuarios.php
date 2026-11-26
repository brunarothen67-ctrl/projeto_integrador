<?php

/*
 * Gerenciamento de usuários (somente administrador)
 *
 *  GET                      -> lista de usuários
 *  PATCH  {id, nome?, tipo?} -> edita nome e/ou tipo da conta
 *  DELETE {id}              -> exclui o usuário (e seus relatos)
 */

require_once __DIR__ . "/_comum.php";

$admin = exigirAdmin();
$metodo = $_SERVER["REQUEST_METHOD"];

try {

    if ($metodo === "GET") {

        $lista = $pdo->query(
            "SELECT u.id, u.nome, u.email, u.tipo, u.foto_perfil, u.data_criacao,
                    (SELECT COUNT(*) FROM relatos r WHERE r.usuario_id = u.id) AS total_relatos
             FROM usuarios u
             ORDER BY u.data_criacao DESC, u.id DESC"
        )->fetchAll();

        responder($lista);
    }

    if ($metodo === "PATCH") {

        $dados = lerJson();
        $id = filter_var($dados["id"] ?? null, FILTER_VALIDATE_INT);

        if (!$id) {
            erro("Usuário inválido.");
        }

        $stmt = $pdo->prepare("SELECT id, tipo FROM usuarios WHERE id = :id");
        $stmt->execute([":id" => $id]);
        $alvo = $stmt->fetch();

        if (!$alvo) {
            erro("Usuário não encontrado.", 404);
        }

        $campos = [];
        $parametros = [":id" => $id];

        if (array_key_exists("nome", $dados)) {

            $nome = is_string($dados["nome"]) ? trim($dados["nome"]) : "";

            if (mb_strlen($nome) < 2 || mb_strlen($nome) > 150) {
                erro("O nome deve ter entre 2 e 150 caracteres.");
            }

            $campos[] = "nome = :nome";
            $parametros[":nome"] = $nome;
        }

        if (array_key_exists("tipo", $dados)) {

            if (!in_array($dados["tipo"], ["usuario", "admin"], true)) {
                erro("Tipo de conta inválido.");
            }

            // Evita o administrador se rebaixar e deixar o sistema sem admin
            if ($id === $admin["id"] && $dados["tipo"] !== "admin") {
                erro("Você não pode remover o seu próprio acesso de administrador.", 403);
            }

            $campos[] = "tipo = :tipo";
            $parametros[":tipo"] = $dados["tipo"];
        }

        if (empty($campos)) {
            erro("Nada para atualizar.");
        }

        $pdo->prepare("UPDATE usuarios SET " . implode(", ", $campos) . " WHERE id = :id")
            ->execute($parametros);

        responder(["sucesso" => true, "mensagem" => "Usuário atualizado com sucesso."]);
    }

    if ($metodo === "DELETE") {

        $dados = lerJson();
        $id = filter_var($dados["id"] ?? null, FILTER_VALIDATE_INT);

        if (!$id) {
            erro("Usuário inválido.");
        }

        if ($id === $admin["id"]) {
            erro("Você não pode excluir a sua própria conta.", 403);
        }

        $stmt = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id = :id");
        $stmt->execute([":id" => $id]);
        $alvo = $stmt->fetch();

        if (!$alvo) {
            erro("Usuário não encontrado.", 404);
        }

        // Imagens dos relatos do usuário (as linhas saem em cascata)
        $stmt = $pdo->prepare(
            "SELECT ri.caminho FROM relato_imagens ri
             JOIN relatos r ON r.id = ri.relato_id
             WHERE r.usuario_id = :id"
        );
        $stmt->execute([":id" => $id]);
        $imagens = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $pdo->prepare("DELETE FROM usuarios WHERE id = :id")->execute([":id" => $id]);

        foreach ($imagens as $caminho) {
            apagarUpload($caminho, "uploads/relatos/");
        }

        apagarUpload($alvo["foto_perfil"], "uploads/perfis/");

        responder(["sucesso" => true, "mensagem" => "Usuário excluído com sucesso."]);
    }

    erro("Método não permitido.", 405);

} catch (PDOException $e) {

    error_log($e->getMessage());
    erro("Não foi possível concluir a operação.", 500);
}
