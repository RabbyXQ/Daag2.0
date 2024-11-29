/*
  Warnings:

  - Made the column `updatedBy` on table `Participator` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Participator` MODIFY `updatedBy` VARCHAR(191) NOT NULL,
    MODIFY `portion` INTEGER NULL;
