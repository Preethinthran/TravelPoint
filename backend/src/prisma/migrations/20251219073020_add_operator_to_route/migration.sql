/*
  Warnings:

  - Added the required column `operator_id` to the `route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `route` ADD COLUMN `operator_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `route` ADD CONSTRAINT `route_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
