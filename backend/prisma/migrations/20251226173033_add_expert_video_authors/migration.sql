/*
  Warnings:

  - You are about to drop the column `authorName` on the `ExpertVideo` table. All the data in the column will be lost.
  - You are about to drop the column `authorUrl` on the `ExpertVideo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ExpertVideo` DROP COLUMN `authorName`,
    DROP COLUMN `authorUrl`;

-- CreateTable
CREATE TABLE `ExpertVideoAuthor` (
    `id` VARCHAR(191) NOT NULL,
    `expertVideoId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExpertVideoAuthor` ADD CONSTRAINT `ExpertVideoAuthor_expertVideoId_fkey` FOREIGN KEY (`expertVideoId`) REFERENCES `ExpertVideo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
