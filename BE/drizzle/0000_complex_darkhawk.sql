CREATE TABLE `users` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`age` INT NOT NULL,
	`email` VARCHAR(255) NOT NULL,
	`password_hash` VARCHAR(255) NOT NULL,
	`is_email_verified` INT NOT NULL DEFAULT 0,
	`role` VARCHAR(50) NOT NULL DEFAULT 'user',
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	`last_login_at` TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE (`email`)
);

CREATE TABLE `sponsors` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`website_url` VARCHAR(255),
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `alumni_event_participation` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`event_date` DATE NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE `alumni_profiles` (
	`user_id` INT NOT NULL,
	`first_name` VARCHAR(255) NOT NULL,
	`last_name` VARCHAR(255) NOT NULL,
	`bio` VARCHAR(1000),
	`graduation_year` INT,
	`degree` VARCHAR(255),
	`current_position` VARCHAR(255),
	`linkedin_url` VARCHAR(255),
	`profile_image_id` INT,
	`appearance_count` INT DEFAULT 0,
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `bids` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`amount` DECIMAL(10,2) NOT NULL,
	`status` VARCHAR(255) NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE `professional_courses` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`title` VARCHAR(255) NOT NULL,
	`provider` VARCHAR(255) NOT NULL,
	`course_url` VARCHAR(255),
	`completed_on` TIMESTAMP,
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `certifications` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`provider` VARCHAR(255) NOT NULL,
	`course_url` VARCHAR(255),
	`completed_on` TIMESTAMP,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `degrees` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`title` VARCHAR(255) NOT NULL,
	`institution_name` VARCHAR(255) NOT NULL,
	`official_url` VARCHAR(255),
	`completed_on` TIMESTAMP,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `employment_history` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`company` VARCHAR(255) NOT NULL,
	`job_title` VARCHAR(255) NOT NULL,
	`start_date` TIMESTAMP NOT NULL,
	`end_date` TIMESTAMP,
	`description` VARCHAR(1000),
	`created_at` TIMESTAMP NOT NULL,
	`updated_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `licenses` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`awarding_body` VARCHAR(255) NOT NULL,
	`license_url` VARCHAR(255),
	`completed_on` TIMESTAMP,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `email_verification_tokens` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`token_hash` VARCHAR(255) NOT NULL,
	`expires_at` TIMESTAMP NOT NULL,
	`used_at` TIMESTAMP,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE (`token_hash`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `password_reset_tokens` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`user_id` INT NOT NULL,
	`token_hash` VARCHAR(255) NOT NULL,
	`expires_at` TIMESTAMP NOT NULL,
	`used_at` TIMESTAMP,
	`created_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE (`token_hash`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `feature_days` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`day` DATE,
	`winner_user_id` INT,
	`winning_bid_id` INT,
	`selected_at` TIMESTAMP,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`winner_user_id`) REFERENCES `users`(`id`),
	FOREIGN KEY (`winning_bid_id`) REFERENCES `bids`(`id`)
);

CREATE TABLE `sponsorship_offers` (
	`id` INT AUTO_INCREMENT NOT NULL,
	`sponsor_id` INT NOT NULL,
	`user_id` INT NOT NULL,
	`offer_type` VARCHAR(255) NOT NULL,
	`reference_id` INT NOT NULL,
	`offer_amount` DECIMAL(10,2) NOT NULL,
	`status` VARCHAR(255) NOT NULL,
	`created_at` TIMESTAMP NOT NULL,
	`expires_at` TIMESTAMP NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors`(`id`) ON DELETE CASCADE,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
