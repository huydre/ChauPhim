-- AlterTable
ALTER TABLE `videos` ADD COLUMN `english_title` VARCHAR(191) NULL,
    ADD COLUMN `images_json` JSON NULL,
    ADD COLUMN `imdb_id` VARCHAR(191) NULL,
    ADD COLUMN `imdb_rating` DOUBLE NULL,
    ADD COLUMN `origin_country` JSON NULL,
    ADD COLUMN `original_title` VARCHAR(191) NULL,
    ADD COLUMN `overview` TEXT NULL,
    ADD COLUMN `quality` ENUM('CAM', 'HD', 'FHD', '4K') NULL DEFAULT 'HD';
