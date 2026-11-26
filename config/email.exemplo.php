<?php
/*
 * Configuração de envio de e-mail (recuperação de senha).
 *
 * COMO USAR:
 *   1. Copie este arquivo para config/email.php
 *   2. Preencha os dados do seu provedor de e-mail (exemplo abaixo: Gmail).
 *   3. O arquivo config/email.php fica fora do Git (veja .gitignore).
 *
 * GMAIL: ative a verificação em duas etapas na conta Google e crie uma
 * "Senha de app" em https://myaccount.google.com/apppasswords .
 * Use essa senha de 16 letras aqui (NÃO a senha normal da conta).
 *
 * Sem este arquivo o sistema não envia e-mail: grava a mensagem em
 * storage/emails.log, onde você pode copiar o link para testar.
 */

return [
    "host" => "smtp.gmail.com",
    "porta" => 587,
    "seguranca" => "tls",              // "tls" = porta 587 | "ssl" = porta 465
    "usuario" => "seu-email@gmail.com",
    "senha" => "SENHA-DE-APP-AQUI",
    "remetente" => "seu-email@gmail.com",
    "nome_remetente" => "NAPNE IFRS Rolante",

    // Endereço público do site, usado para montar o link do e-mail
    "url_site" => "http://localhost:8082"
];
