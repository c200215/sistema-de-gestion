-- AlterTable
ALTER TABLE `correos` ADD COLUMN `cuentaGoogle` VARCHAR(254) NULL,
    ADD COLUMN `mensajeGoogleId` VARCHAR(255) NULL,
    MODIFY `cuerpo` MEDIUMTEXT NOT NULL;

-- CreateTable
CREATE TABLE `gmail_cuenta` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `correo` VARCHAR(254) NULL,
    `tokensCifrados` TEXT NULL,
    `requiereConexion` BOOLEAN NOT NULL DEFAULT false,
    `historyId` VARCHAR(100) NULL,
    `syncModo` VARCHAR(20) NULL,
    `syncPagina` TEXT NULL,
    `syncAncla` VARCHAR(100) NULL,
    `syncConsulta` VARCHAR(200) NULL,
    `ultimaSync` DATETIME(3) NULL,
    `ultimoError` VARCHAR(255) NULL,
    `operacionId` CHAR(36) NULL,
    `operacionHasta` DATETIME(3) NULL,
    `actualizado` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gmail_oauth_estados` (
    `hash` CHAR(64) NOT NULL,
    `navegadorHash` CHAR(64) NOT NULL,
    `sesionHash` CHAR(64) NOT NULL,
    `verifierCifrado` TEXT NOT NULL,
    `expira` DATETIME(3) NOT NULL,

    INDEX `gmail_oauth_estados_expira_idx`(`expira`),
    PRIMARY KEY (`hash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `correo_adjuntos` (
    `id` CHAR(36) NOT NULL,
    `correoId` INTEGER UNSIGNED NOT NULL,
    `parteId` VARCHAR(100) NOT NULL,
    `googleAdjuntoId` TEXT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(150) NOT NULL,
    `bytes` INTEGER UNSIGNED NOT NULL,
    `contenido` MEDIUMBLOB NULL,

    UNIQUE INDEX `correo_adjuntos_correoId_parteId_key`(`correoId`, `parteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `correo_adjuntos` ADD CONSTRAINT `correo_adjuntos_correoId_fkey` FOREIGN KEY (`correoId`) REFERENCES `correos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
