-- CreateTable
CREATE TABLE `BusinessCategory` (
    `id` VARCHAR(36) NOT NULL,
    `pid` VARCHAR(36) NULL,
    `name` VARCHAR(200) NOT NULL,
    `icon` VARCHAR(50) NULL,
    `ordinal` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    UNIQUE INDEX `BusinessCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `path` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    UNIQUE INDEX `Template_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlaceholderGroup` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    UNIQUE INDEX `PlaceholderGroup_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlaceholderItem` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `format` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    UNIQUE INDEX `PlaceholderItem_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BcTplRel` (
    `bcId` VARCHAR(191) NOT NULL,
    `tplId` VARCHAR(191) NOT NULL,
    `ordinal` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    PRIMARY KEY (`bcId`, `tplId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TplPhGrpRel` (
    `tplId` VARCHAR(191) NOT NULL,
    `phGrpId` VARCHAR(191) NOT NULL,
    `ordinal` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    PRIMARY KEY (`tplId`, `phGrpId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhGrpItmRel` (
    `phGrpId` VARCHAR(191) NOT NULL,
    `phItmId` VARCHAR(191) NOT NULL,
    `ordinal` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL,

    PRIMARY KEY (`phGrpId`, `phItmId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'user',
    `email` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `casbin_rule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ptype` VARCHAR(191) NOT NULL,
    `v0` VARCHAR(191) NULL,
    `v1` VARCHAR(191) NULL,
    `v2` VARCHAR(191) NULL,
    `v3` VARCHAR(191) NULL,
    `v4` VARCHAR(191) NULL,
    `v5` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BusinessCategory` ADD CONSTRAINT `BusinessCategory_pid_fkey` FOREIGN KEY (`pid`) REFERENCES `BusinessCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BcTplRel` ADD CONSTRAINT `BcTplRel_bcId_fkey` FOREIGN KEY (`bcId`) REFERENCES `BusinessCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BcTplRel` ADD CONSTRAINT `BcTplRel_tplId_fkey` FOREIGN KEY (`tplId`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TplPhGrpRel` ADD CONSTRAINT `TplPhGrpRel_tplId_fkey` FOREIGN KEY (`tplId`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TplPhGrpRel` ADD CONSTRAINT `TplPhGrpRel_phGrpId_fkey` FOREIGN KEY (`phGrpId`) REFERENCES `PlaceholderGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhGrpItmRel` ADD CONSTRAINT `PhGrpItmRel_phGrpId_fkey` FOREIGN KEY (`phGrpId`) REFERENCES `PlaceholderGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhGrpItmRel` ADD CONSTRAINT `PhGrpItmRel_phItmId_fkey` FOREIGN KEY (`phItmId`) REFERENCES `PlaceholderItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
