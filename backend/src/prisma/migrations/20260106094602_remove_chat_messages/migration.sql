/*
  Warnings:

  - You are about to drop the `chatmessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chatmessage` DROP FOREIGN KEY `ChatMessage_booking_id_fkey`;

-- DropTable
DROP TABLE `chatmessage`;
