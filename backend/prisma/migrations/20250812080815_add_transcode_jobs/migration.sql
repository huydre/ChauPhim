-- CreateTable
CREATE TABLE `transcode_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `videoId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `status` ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `qualities` JSON NOT NULL,
    `inputPath` VARCHAR(191) NOT NULL,
    `outputPath` VARCHAR(191) NOT NULL,
    `errorMessage` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transcode_jobs_jobId_key`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transcode_jobs` ADD CONSTRAINT `transcode_jobs_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `videos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
