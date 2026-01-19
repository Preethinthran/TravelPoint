-- DropForeignKey
ALTER TABLE `booked_seats` DROP FOREIGN KEY `booked_seats_booking_id_fkey`;

-- DropForeignKey
ALTER TABLE `booked_seats` DROP FOREIGN KEY `booked_seats_seat_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_drop_stop_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_passenger_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_pickup_stop_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_trip_id_fkey`;

-- DropForeignKey
ALTER TABLE `bus` DROP FOREIGN KEY `bus_operator_id_fkey`;

-- DropForeignKey
ALTER TABLE `route` DROP FOREIGN KEY `route_operator_id_fkey`;

-- DropForeignKey
ALTER TABLE `seat` DROP FOREIGN KEY `seat_bus_id_fkey`;

-- DropForeignKey
ALTER TABLE `stops` DROP FOREIGN KEY `stops_path_id_fkey`;

-- DropForeignKey
ALTER TABLE `trips` DROP FOREIGN KEY `trips_bus_id_fkey`;

-- DropForeignKey
ALTER TABLE `trips` DROP FOREIGN KEY `trips_path_id_fkey`;

-- AlterTable
ALTER TABLE `trips` ADD COLUMN `status` ENUM('Scheduled', 'Cancelled', 'Completed', 'Live') NOT NULL DEFAULT 'Scheduled';

-- CreateTable
CREATE TABLE `saved_travellers` (
    `traveller_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fk_saved_travellers_user`(`user_id`),
    PRIMARY KEY (`traveller_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `saved_travellers` ADD CONSTRAINT `saved_travellers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
