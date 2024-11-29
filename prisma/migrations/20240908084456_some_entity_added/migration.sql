/*
  Warnings:

  - You are about to drop the column `landId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LandParticipator` table. All the data in the column will be lost.
  - You are about to drop the column `relationId` on the `LandParticipator` table. All the data in the column will be lost.
  - You are about to drop the `relation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `marketItemId` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participatorId` to the `LandParticipator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recievedBy` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Bid` DROP COLUMN `landId`,
    ADD COLUMN `marketItemId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `LandParticipator` DROP COLUMN `name`,
    DROP COLUMN `relationId`,
    ADD COLUMN `participatorId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `recievedBy` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `relation`;

-- CreateTable
CREATE TABLE `Participator` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `relation` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `history` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Connection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower` VARCHAR(191) NOT NULL,
    `folowed` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender` VARCHAR(191) NOT NULL,
    `reciever` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
