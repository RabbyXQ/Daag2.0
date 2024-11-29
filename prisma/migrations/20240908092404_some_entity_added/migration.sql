/*
  Warnings:

  - You are about to drop the column `landId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `marketItemId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `landId`,
    ADD COLUMN `marketItemId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Land` MODIFY `landType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Notification` DROP COLUMN `updatedAt`;
