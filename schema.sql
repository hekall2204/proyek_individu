CREATE DATABASE IF NOT EXISTS `db_3PutraSi77` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_3PutraSi77`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nama` VARCHAR(100) NOT NULL,
    `whatsapp` VARCHAR(20) NOT NULL UNIQUE,
    `role` ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `services` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nama_layanan` VARCHAR(100) NOT NULL,
    `harga_per_m2` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `kode_trx` VARCHAR(20) NOT NULL UNIQUE,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('pengajuan', 'survei_dp', 'fabrikasi', 'finishing', 'pemasangan', 'selesai', 'batal') NOT NULL DEFAULT 'pengajuan',
    `total_estimasi` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `catatan` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `service_id` BIGINT UNSIGNED NOT NULL,
    `ukuran_m2` DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_items_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;