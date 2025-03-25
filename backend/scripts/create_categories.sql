-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing categories table if it exists
DROP TABLE IF EXISTS `categories`;

-- Create categories table with bigint unsigned ID to match journal_entries table
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL DEFAULT 1,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) DEFAULT '#000000',
  PRIMARY KEY (`id`),
  KEY `idx_categories_deleted_at` (`deleted_at`)
);

-- Insert global categories for all users (using default user_id 1)
INSERT INTO `categories` (`id`, `user_id`, `name`, `color`, `created_at`, `updated_at`) VALUES
(1, 1, 'Personal', '#4285F4', NOW(), NOW()),
(2, 1, 'Work', '#EA4335', NOW(), NOW()),
(3, 1, 'Ideas', '#FBBC05', NOW(), NOW()),
(4, 1, 'Learning', '#34A853', NOW(), NOW()),
(5, 1, 'Health', '#FF6D01', NOW(), NOW()),
(6, 1, 'Travel', '#46BDC6', NOW(), NOW()),
(7, 1, 'Finance', '#7B1FA2', NOW(), NOW()),
(8, 1, 'Family', '#0097A7', NOW(), NOW()),
(9, 1, 'Other', '#757575', NOW(), NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1; 