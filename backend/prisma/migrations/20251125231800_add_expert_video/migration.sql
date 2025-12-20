/*
  Warnings:

  - Added the required column `updatedAt` to the `ExpertVideo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ExpertVideo` ADD COLUMN `authorName` VARCHAR(191) NULL,
    ADD COLUMN `authorUrl` VARCHAR(191) NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
