/*
  Warnings:

  - You are about to drop the column `createdAt` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the `cartitem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Cart_userId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Product_sellerId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `cart` DROP COLUMN `createdAt`,
    ADD COLUMN `productId` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL;

-- DropTable
DROP TABLE `cartitem`;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
