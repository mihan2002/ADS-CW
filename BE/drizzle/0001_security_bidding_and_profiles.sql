-- Adds API key scoping + usage tracking
CREATE TABLE `api_clients` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `revoked_at` TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE `api_keys` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `client_id` INT NOT NULL,
  `key_prefix` VARCHAR(32) NOT NULL,
  `key_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `last_used_at` TIMESTAMP,
  `revoked_at` TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE (`key_hash`),
  FOREIGN KEY (`client_id`) REFERENCES `api_clients`(`id`) ON DELETE CASCADE
);

CREATE TABLE `api_key_permissions` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `api_key_id` INT NOT NULL,
  `permission` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE CASCADE
);

CREATE TABLE `api_key_usage` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `api_key_id` INT NOT NULL,
  `endpoint` VARCHAR(255) NOT NULL,
  `method` VARCHAR(16) NOT NULL,
  `status_code` INT NOT NULL,
  `used_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE CASCADE
);

-- Adds profile attributes required by coursework filters/charts
ALTER TABLE `alumni_profiles`
  ADD COLUMN `programme` VARCHAR(255),
  ADD COLUMN `graduation_date` DATE,
  ADD COLUMN `industry_sector` VARCHAR(255),
  ADD COLUMN `geography` VARCHAR(255);

-- Adds target_day so bids are for a specific featured slot
ALTER TABLE `bids`
  ADD COLUMN `target_day` DATE NULL;

UPDATE `bids`
  SET `target_day` = DATE(DATE_ADD(`created_at`, INTERVAL 1 DAY))
  WHERE `target_day` IS NULL;

ALTER TABLE `bids`
  MODIFY COLUMN `target_day` DATE NOT NULL;

