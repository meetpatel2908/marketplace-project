/*
  Warnings:

  - You are about to drop the column `type` on the `product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Product_sellerId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `type`;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
