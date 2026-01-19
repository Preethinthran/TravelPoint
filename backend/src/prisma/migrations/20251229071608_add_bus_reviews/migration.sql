-- CreateTable
CREATE TABLE `bus_reviews` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `stars` INTEGER NOT NULL,
    `review_text` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `booking_id` INTEGER NOT NULL,
    `bus_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `bus_reviews_booking_id_key`(`booking_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bus_reviews` ADD CONSTRAINT `bus_reviews_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bus_reviews` ADD CONSTRAINT `bus_reviews_bus_id_fkey` FOREIGN KEY (`bus_id`) REFERENCES `bus`(`bus_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bus_reviews` ADD CONSTRAINT `bus_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
