-- AlterTable
ALTER TABLE `audit_logs` ADD COLUMN `details` TEXT NULL,
    ADD COLUMN `resource_id` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS';
