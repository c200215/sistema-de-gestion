-- Conserva los registros y sus adjuntos antes de retirar el tipo.
UPDATE `trabajos` SET `tipo` = 'Proyecto', `version` = `version` + 1 WHERE `tipo` = 'Presupuesto';
UPDATE `correos` SET `tipo` = 'Proyecto' WHERE `tipo` = 'Presupuesto';
ALTER TABLE `trabajos` MODIFY `tipo` ENUM('Proyecto', 'Consulta', 'Soporte técnico') NOT NULL;
ALTER TABLE `correos` MODIFY `tipo` ENUM('Proyecto', 'Consulta', 'Soporte técnico') NOT NULL DEFAULT 'Consulta';
