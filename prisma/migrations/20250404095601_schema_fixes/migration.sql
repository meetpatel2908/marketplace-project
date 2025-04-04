/*
  Warnings:

  - You are about to alter the column `userRole` on the `message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- DropIndex
DROP INDEX `Cart_productId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Cart_userId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Product_sellerId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `cart` MODIFY `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `message` MODIFY `userRole` ENUM('ADMIN', 'SELLER', 'USER') NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
