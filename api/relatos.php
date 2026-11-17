<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "../conexao.php";

$metodo = $_SERVER["REQUEST_METHOD"];

// CADASTRAR RELATO
if ($metodo === "POST") {

    $dados = json_decode(file_get_contents("php://input"), true);

    if (
        empty($dados["titulo"]) ||
        empty($dados["tipo"]) ||
        empty($dados["texto"])
    ) {
        http_response_code(400);
        echo json_encode(["erro" => "Preencha os campos obrigatórios."]);
        exit;
    }

    $titulo = trim($dados["titulo"]);
    $tipo = trim($dados["tipo"]);
    $texto = trim($dados["texto"]);
    $sentimento = $dados["sentimento"] ?? null;
    $anonimo = !empty($dados["anonimo"]) ? 1 : 0;
    $nome = $anonimo ? null : ($dados["nome"] ?? null);
    $email = $anonimo ? null : ($dados["email"] ?? null);

    try {
        $sql = "INSERT INTO relatos
                (titulo, tipo, texto, sentimento, anonimo, nome, email, status)
                VALUES
                (:titulo, :tipo, :texto, :sentimento, :anonimo, :nome, :email, 'pendente')";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ":titulo" => $titulo,
            ":tipo" => $tipo,
            ":texto" => $texto,
            ":sentimento" => $sentimento,
            ":anonimo" => $anonimo,
            ":nome" => $nome,
            ":email" => $email
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Relato enviado para análise."
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["erro" => "Não foi possível salvar o relato."]);
    }

    exit;
}

// CONSULTAR RELATOS
if ($metodo === "GET") {

    try {
        $stmt = $pdo->query(
            "SELECT * FROM relatos ORDER BY criado_em DESC"
        );

        echo json_encode($stmt->fetchAll());

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["erro" => "Não foi possível consultar os relatos."]);
    }

    exit;
}

// MÉTODO NÃO PERMITIDO
http_response_code(405);

echo json_encode(["erro" => "Método não permitido."]);
