<?php
/*
 * Envio de e-mail por SMTP (sem dependências externas).
 *
 * A configuração fica em config/email.php (veja config/email.exemplo.php).
 * Se o arquivo não existir, o e-mail NÃO é enviado: ele é gravado em
 * storage/emails.log para você testar localmente.
 */

function configuracaoEmail(): ?array
{
    $arquivo = __DIR__ . "/../config/email.php";

    if (!is_file($arquivo)) {
        return null;
    }

    $config = require $arquivo;

    return is_array($config) && !empty($config["host"]) ? $config : null;
}

function lerRespostaSmtp($socket): string
{
    $resposta = "";

    while (($linha = fgets($socket, 515)) !== false) {
        $resposta .= $linha;

        if (strlen($linha) < 4 || $linha[3] === " ") {
            break;
        }
    }

    return $resposta;
}

function comandoSmtp($socket, string $comando, array $codigosOk): string
{
    fwrite($socket, $comando . "\r\n");
    $resposta = lerRespostaSmtp($socket);

    if (!in_array((int)substr($resposta, 0, 3), $codigosOk, true)) {
        throw new RuntimeException("SMTP recusou o comando: " . trim($resposta));
    }

    return $resposta;
}

function enviarEmail(string $para, string $assunto, string $textoHtml, string $textoSimples): bool
{
    $config = configuracaoEmail();

    // Modo desenvolvimento: sem SMTP configurado, grava em arquivo
    if (!$config) {
        $pasta = __DIR__ . "/../storage";

        if (!is_dir($pasta)) {
            @mkdir($pasta, 0755, true);
        }

        $registro = "==== " . date("Y-m-d H:i:s") . " ====\nPara: $para\nAssunto: $assunto\n\n$textoSimples\n\n";

        return file_put_contents($pasta . "/emails.log", $registro, FILE_APPEND | LOCK_EX) !== false;
    }

    $porta = (int)($config["porta"] ?? 587);
    $seguranca = $config["seguranca"] ?? "tls"; // "tls" (STARTTLS, porta 587) ou "ssl" (porta 465)
    $remetente = $config["remetente"] ?? $config["usuario"];
    $nomeRemetente = $config["nome_remetente"] ?? "NAPNE IFRS Rolante";

    $endereco = ($seguranca === "ssl" ? "ssl://" : "") . $config["host"] . ":" . $porta;

    $socket = @stream_socket_client($endereco, $codigoErro, $textoErro, 15);

    if (!$socket) {
        throw new RuntimeException("Não foi possível conectar ao servidor SMTP: $textoErro");
    }

    stream_set_timeout($socket, 15);

    try {

        $resposta = lerRespostaSmtp($socket);

        if ((int)substr($resposta, 0, 3) !== 220) {
            throw new RuntimeException("Resposta inesperada do SMTP: " . trim($resposta));
        }

        $nomeLocal = "localhost";

        comandoSmtp($socket, "EHLO $nomeLocal", [250]);

        if ($seguranca === "tls") {
            comandoSmtp($socket, "STARTTLS", [220]);

            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException("Falha ao iniciar a conexão segura (TLS).");
            }

            comandoSmtp($socket, "EHLO $nomeLocal", [250]);
        }

        if (!empty($config["usuario"])) {
            comandoSmtp($socket, "AUTH LOGIN", [334]);
            comandoSmtp($socket, base64_encode($config["usuario"]), [334]);
            comandoSmtp($socket, base64_encode($config["senha"] ?? ""), [235]);
        }

        comandoSmtp($socket, "MAIL FROM:<$remetente>", [250]);
        comandoSmtp($socket, "RCPT TO:<$para>", [250, 251]);
        comandoSmtp($socket, "DATA", [354]);

        $limite = "napne_" . bin2hex(random_bytes(8));

        $cabecalhos = [
            "From: =?UTF-8?B?" . base64_encode($nomeRemetente) . "?= <$remetente>",
            "To: <$para>",
            "Subject: =?UTF-8?B?" . base64_encode($assunto) . "?=",
            "Date: " . date("r"),
            "Message-ID: <" . bin2hex(random_bytes(12)) . "@napne.local>",
            "MIME-Version: 1.0",
            "Content-Type: multipart/alternative; boundary=\"$limite\""
        ];

        $corpo = "--$limite\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($textoSimples))
            . "--$limite\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($textoHtml))
            . "--$limite--\r\n";

        // Linhas que começam com "." precisam ser duplicadas no protocolo SMTP
        $mensagem = str_replace("\r\n.", "\r\n..", implode("\r\n", $cabecalhos) . "\r\n\r\n" . $corpo);

        comandoSmtp($socket, $mensagem . "\r\n.", [250]);
        comandoSmtp($socket, "QUIT", [221]);

    } finally {

        fclose($socket);
    }

    return true;
}
