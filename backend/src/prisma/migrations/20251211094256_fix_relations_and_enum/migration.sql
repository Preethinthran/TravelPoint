/*
  Warnings:

  - Added the required column `passenger_age` to the `booked_seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passenger_gender` to the `booked_seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seat_number` to the `booked_seats` table without a default value. This is not possible if the table is not empty.
  - Made the column `passenger_name` on table `booked_seats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `booked_seats` ADD COLUMN `passenger_age` INTEGER NOT NULL,
    ADD COLUMN `passenger_gender` VARCHAR(10) NOT NULL,
    ADD COLUMN `seat_number` VARCHAR(10) NOT NULL,
    MODIFY `passenger_name` VARCHAR(100) NOT NULL;

-- AddForeignKey
ALTER TABLE `booked_seats` ADD CONSTRAINT `booked_seats_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booked_seats` ADD CONSTRAINT `booked_seats_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `seat`(`seat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_passenger_id_fkey` FOREIGN KEY (`passenger_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `trips`(`trip_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_pickup_stop_id_fkey` FOREIGN KEY (`pickup_stop_id`) REFERENCES `stops`(`stop_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_drop_stop_id_fkey` FOREIGN KEY (`drop_stop_id`) REFERENCES `stops`(`stop_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bus` ADD CONSTRAINT `bus_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat` ADD CONSTRAINT `seat_bus_id_fkey` FOREIGN KEY (`bus_id`) REFERENCES `bus`(`bus_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stops` ADD CONSTRAINT `stops_path_id_fkey` FOREIGN KEY (`path_id`) REFERENCES `route`(`path_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_bus_id_fkey` FOREIGN KEY (`bus_id`) REFERENCES `bus`(`bus_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_path_id_fkey` FOREIGN KEY (`path_id`) REFERENCES `route`(`path_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
