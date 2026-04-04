-- CreateTable
CREATE TABLE `questions` (
    `question` VARCHAR(191) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `upvotes` INTEGER NOT NULL,
    `downvotes` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `questions_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
