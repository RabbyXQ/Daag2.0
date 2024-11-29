/*
  Warnings:

  - You are about to alter the column `follower` on the `Connection` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `folowed` on the `Connection` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `portion` on the `Participator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Connection` MODIFY `follower` INTEGER NULL,
    MODIFY `folowed` INTEGER NULL;

-- AlterTable
ALTER TABLE `Participator` DROP COLUMN `portion`,
    ADD COLUMN `part` INTEGER NULL;
