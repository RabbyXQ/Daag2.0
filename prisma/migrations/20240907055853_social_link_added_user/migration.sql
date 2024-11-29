/*
  Warnings:

  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `dob` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `age`,
    MODIFY `dob` DATETIME(3) NULL;
