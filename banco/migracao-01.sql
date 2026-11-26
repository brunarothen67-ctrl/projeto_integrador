-- Migração 01 (somente adições: nenhuma tabela ou dado existente é apagado)
-- Executar uma única vez no banco "napne".

-- Vínculo do relato com o autor (antes era apenas pelo e-mail)
ALTER TABLE `relatos`
  ADD COLUMN `usuario_id` INT NULL AFTER `id`,
  ADD COLUMN `atualizado_em` TIMESTAMP NULL DEFAULT NULL,
  ADD KEY `idx_relatos_usuario` (`usuario_id`),
  ADD CONSTRAINT `fk_relatos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

-- Relatos já existentes: ligar ao usuário pelo e-mail que foi gravado
UPDATE `relatos` r
JOIN `usuarios` u ON u.email COLLATE utf8mb4_unicode_ci = r.email COLLATE utf8mb4_unicode_ci
SET r.usuario_id = u.id
WHERE r.usuario_id IS NULL;

-- Tokens de recuperação de senha (guarda apenas o hash do token)
CREATE TABLE IF NOT EXISTS `recuperacao_senha` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expira_em` datetime NOT NULL,
  `usado_em` datetime DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token_hash` (`token_hash`),
  KEY `idx_rec_usuario` (`usuario_id`),
  CONSTRAINT `fk_rec_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Conteúdos do site gerenciados pelo admin (projetos, eventos e materiais)
CREATE TABLE IF NOT EXISTS `conteudos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('projetos','eventos','materiais') NOT NULL,
  `ordem` int NOT NULL DEFAULT 0,
  `dados` longtext NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conteudos_tipo` (`tipo`,`ordem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
