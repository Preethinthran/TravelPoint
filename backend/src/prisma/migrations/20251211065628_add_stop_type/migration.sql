-- CreateTable
CREATE TABLE `booked_seats` (
    `ticket_id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `seat_id` INTEGER NOT NULL,
    `passenger_name` VARCHAR(100) NULL,

    INDEX `fk_booked_booking`(`booking_id`),
    INDEX `fk_booked_seat`(`seat_id`),
    PRIMARY KEY (`ticket_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `booking_id` INTEGER NOT NULL AUTO_INCREMENT,
    `passenger_id` INTEGER NOT NULL,
    `trip_id` INTEGER NOT NULL,
    `pickup_stop_id` INTEGER NOT NULL,
    `drop_stop_id` INTEGER NOT NULL,
    `booking_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `amount_paid` DECIMAL(10, 2) NOT NULL,
    `booking_status` ENUM('Confirmed', 'Cancelled', 'Pending') NULL DEFAULT 'Confirmed',

    INDEX `fk_bookings_drop`(`drop_stop_id`),
    INDEX `fk_bookings_passenger`(`passenger_id`),
    INDEX `fk_bookings_pickup`(`pickup_stop_id`),
    INDEX `fk_bookings_trip`(`trip_id`),
    PRIMARY KEY (`booking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bus` (
    `bus_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bus_number` VARCHAR(20) NOT NULL,
    `operator_id` INTEGER NOT NULL,
    `total_seats` INTEGER NOT NULL,
    `bus_type` ENUM('AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'AC Sleeper', 'Non-AC Seater', 'Volvo Multi-Axle', 'AC Seater') NULL,
    `rating` DECIMAL(3, 1) NULL DEFAULT 0.0,
    `total_ratings` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `bus_number`(`bus_number`),
    INDEX `fk_bus_operator`(`operator_id`),
    PRIMARY KEY (`bus_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route` (
    `path_id` INTEGER NOT NULL AUTO_INCREMENT,
    `route_name` VARCHAR(100) NOT NULL,
    `total_distance` DECIMAL(10, 2) NULL,
    `estimated_time` VARCHAR(50) NULL,

    PRIMARY KEY (`path_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seat` (
    `seat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bus_id` INTEGER NOT NULL,
    `seat_number` VARCHAR(10) NULL,
    `seat_type` ENUM('Seater', 'Sleeper_Upper', 'Sleeper_Lower') NULL,
    `price` DECIMAL(10, 2) NULL,
    `status` ENUM('good', 'repair', 'maintenance', 'damaged') NULL DEFAULT 'good',

    INDEX `fk_seat_bus`(`bus_id`),
    PRIMARY KEY (`seat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service` (
    `request_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `agent_id` INTEGER NULL,
    `message` TEXT NULL,
    `status` ENUM('Open', 'In Progress', 'Resolved', 'Closed') NULL DEFAULT 'Open',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_service_agent`(`agent_id`),
    INDEX `fk_service_user`(`user_id`),
    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stops` (
    `stop_id` INTEGER NOT NULL AUTO_INCREMENT,
    `path_id` INTEGER NOT NULL,
    `stop_name` VARCHAR(100) NOT NULL,
    `order_id` INTEGER NOT NULL,
    `distance` DECIMAL(10, 2) NULL,
    `price` DECIMAL(10, 2) NULL,
    `estimated_time` VARCHAR(50) NULL,
    `stop_type` ENUM('Boarding', 'Dropping', 'Both') NOT NULL DEFAULT 'Both',

    INDEX `fk_stops_route`(`path_id`),
    PRIMARY KEY (`stop_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trips` (
    `trip_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bus_id` INTEGER NOT NULL,
    `path_id` INTEGER NOT NULL,
    `departure_time` DATETIME(0) NOT NULL,
    `arrival_time` DATETIME(0) NOT NULL,

    INDEX `fk_trips_bus`(`bus_id`),
    INDEX `fk_trips_route`(`path_id`),
    PRIMARY KEY (`trip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `role` ENUM('passenger', 'admin', 'agent', 'operator') NULL DEFAULT 'passenger',

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone`(`phone`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
