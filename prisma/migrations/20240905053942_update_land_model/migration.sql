-- CreateTable
CREATE TABLE `land` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `size` DOUBLE NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `landType` INTEGER NOT NULL DEFAULT 0,
    `marketValue` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `polygons` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
