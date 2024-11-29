/*
  Warnings:

  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `age`,
    ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `dob` VARCHAR(191) NULL;
