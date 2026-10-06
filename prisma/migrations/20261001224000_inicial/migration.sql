-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(160) NOT NULL,
    `correo` VARCHAR(254) NOT NULL,
    `perfil` ENUM('Administrador', 'Trabajador') NOT NULL DEFAULT 'Trabajador',
    `especialidad` VARCHAR(100) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `password_hash` VARCHAR(200) NOT NULL,
    `acceso` DATETIME(3) NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_nombre_key`(`nombre`),
    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    INDEX `usuarios_perfil_activo_idx`(`perfil`, `activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones` (
    `token` CHAR(64) NOT NULL,
    `usuarioId` INTEGER UNSIGNED NOT NULL,
    `expira` DATETIME(3) NOT NULL,

    INDEX `sesiones_expira_idx`(`expira`),
    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trabajos` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(250) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipo` ENUM('Presupuesto', 'Proyecto', 'Consulta', 'Soporte técnico') NOT NULL,
    `cliente` VARCHAR(250) NOT NULL,
    `contacto` VARCHAR(254) NOT NULL,
    `canal` VARCHAR(80) NOT NULL,
    `prioridad` ENUM('Urgente', 'Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
    `estado` ENUM('Pendiente', 'En curso', 'Terminado') NOT NULL DEFAULT 'Pendiente',
    `fecha` DATE NULL,
    `responsableId` INTEGER UNSIGNED NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado` DATETIME(3) NOT NULL,

    INDEX `trabajos_responsableId_estado_idx`(`responsableId`, `estado`),
    INDEX `trabajos_fecha_tipo_idx`(`fecha`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tareas` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `trabajoId` INTEGER UNSIGNED NOT NULL,
    `asignadoId` INTEGER UNSIGNED NOT NULL,
    `titulo` VARCHAR(250) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `estado` ENUM('Pendiente', 'En curso', 'Terminado') NOT NULL DEFAULT 'Pendiente',
    `fecha` DATE NULL,
    `terminada` DATETIME(3) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `creada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizada` DATETIME(3) NOT NULL,

    INDEX `tareas_asignadoId_estado_idx`(`asignadoId`, `estado`),
    INDEX `tareas_trabajoId_orden_idx`(`trabajoId`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `trabajoId` INTEGER UNSIGNED NOT NULL,
    `tareaId` INTEGER UNSIGNED NULL,
    `autorId` INTEGER UNSIGNED NOT NULL,
    `texto` TEXT NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comentarios_trabajoId_fecha_idx`(`trabajoId`, `fecha`),
    INDEX `comentarios_tareaId_fecha_idx`(`tareaId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos` (
    `id` CHAR(36) NOT NULL,
    `autorId` INTEGER UNSIGNED NOT NULL,
    `trabajoId` INTEGER UNSIGNED NULL,
    `tareaId` INTEGER UNSIGNED NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `contenido` MEDIUMBLOB NOT NULL,
    `bytes` INTEGER UNSIGNED NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `documentos_trabajoId_idx`(`trabajoId`),
    INDEX `documentos_tareaId_idx`(`tareaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `trabajoId` INTEGER UNSIGNED NOT NULL,
    `tareaId` INTEGER UNSIGNED NULL,
    `autorId` INTEGER UNSIGNED NOT NULL,
    `texto` VARCHAR(500) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historial_trabajoId_fecha_idx`(`trabajoId`, `fecha`),
    INDEX `historial_tareaId_fecha_idx`(`tareaId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mensajes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `emisorId` INTEGER UNSIGNED NOT NULL,
    `receptorId` INTEGER UNSIGNED NULL,
    `texto` TEXT NOT NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mensajes_emisorId_receptorId_creado_idx`(`emisorId`, `receptorId`, `creado`),
    INDEX `mensajes_receptorId_creado_idx`(`receptorId`, `creado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturas` (
    `usuarioId` INTEGER UNSIGNED NOT NULL,
    `conversacion` VARCHAR(30) NOT NULL,
    `ultimo` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`usuarioId`, `conversacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER UNSIGNED NOT NULL,
    `texto` VARCHAR(500) NOT NULL,
    `enlace` VARCHAR(200) NOT NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leida` BOOLEAN NOT NULL DEFAULT false,

    INDEX `notificaciones_usuarioId_leida_creado_idx`(`usuarioId`, `leida`, `creado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `correos` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `externoId` VARCHAR(255) NULL,
    `remitente` VARCHAR(160) NOT NULL,
    `correo` VARCHAR(254) NOT NULL,
    `asunto` VARCHAR(255) NOT NULL,
    `cuerpo` TEXT NOT NULL,
    `cliente` VARCHAR(250) NOT NULL,
    `tipo` ENUM('Presupuesto', 'Proyecto', 'Consulta', 'Soporte técnico') NOT NULL DEFAULT 'Consulta',
    `recibido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `descartado` BOOLEAN NOT NULL DEFAULT false,
    `trabajoId` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `correos_externoId_key`(`externoId`),
    INDEX `correos_trabajoId_descartado_idx`(`trabajoId`, `descartado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intentos_login` (
    `clave` CHAR(64) NOT NULL,
    `intentos` INTEGER NOT NULL DEFAULT 0,
    `inicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `intentos_login_inicio_idx`(`inicio`),
    PRIMARY KEY (`clave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sesiones` ADD CONSTRAINT `sesiones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trabajos` ADD CONSTRAINT `trabajos_responsableId_fkey` FOREIGN KEY (`responsableId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_trabajoId_fkey` FOREIGN KEY (`trabajoId`) REFERENCES `trabajos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_asignadoId_fkey` FOREIGN KEY (`asignadoId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_trabajoId_fkey` FOREIGN KEY (`trabajoId`) REFERENCES `trabajos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `tareas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_trabajoId_fkey` FOREIGN KEY (`trabajoId`) REFERENCES `trabajos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `tareas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial` ADD CONSTRAINT `historial_trabajoId_fkey` FOREIGN KEY (`trabajoId`) REFERENCES `trabajos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial` ADD CONSTRAINT `historial_tareaId_fkey` FOREIGN KEY (`tareaId`) REFERENCES `tareas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial` ADD CONSTRAINT `historial_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_emisorId_fkey` FOREIGN KEY (`emisorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mensajes` ADD CONSTRAINT `mensajes_receptorId_fkey` FOREIGN KEY (`receptorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturas` ADD CONSTRAINT `lecturas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `correos` ADD CONSTRAINT `correos_trabajoId_fkey` FOREIGN KEY (`trabajoId`) REFERENCES `trabajos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
