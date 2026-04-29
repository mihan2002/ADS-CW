CREATE TABLE `alumni_event_participation` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`event_date` date NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `alumni_event_participation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alumni_profiles` (
	`user_id` int NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`bio` varchar(1000),
	`programme` varchar(255),
	`graduation_year` int,
	`graduation_date` date,
	`degree` varchar(255),
	`industry_sector` varchar(255),
	`geography` varchar(255),
	`current_position` varchar(255),
	`linkedin_url` varchar(255),
	`profile_image_id` int,
	`appearance_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_clients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	CONSTRAINT `api_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_key_permissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`api_key_id` int NOT NULL,
	`permission` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `api_key_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_key_usage` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`api_key_id` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(16) NOT NULL,
	`status_code` int NOT NULL,
	`used_at` timestamp NOT NULL,
	CONSTRAINT `api_key_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`key_prefix` varchar(32) NOT NULL,
	`key_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`last_used_at` timestamp,
	`revoked_at` timestamp,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_hash_unique` UNIQUE(`key_hash`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`target_day` date NOT NULL,
	`amount` decimal NOT NULL,
	`status` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `bids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`course_url` varchar(255),
	`completed_on` timestamp,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `degrees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`institution_name` varchar(255) NOT NULL,
	`official_url` varchar(255),
	`completed_on` timestamp,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `degrees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_verification_tokens` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `email_verification_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_verification_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `employment_history` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`company` varchar(255) NOT NULL,
	`job_title` varchar(255) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`description` varchar(1000),
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `employment_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_days` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`day` date,
	`winner_user_id` int,
	`winning_bid_id` int,
	`selected_at` timestamp,
	CONSTRAINT `feature_days_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`awarding_body` varchar(255) NOT NULL,
	`license_url` varchar(255),
	`completed_on` timestamp,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `licenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `professional_courses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`course_url` varchar(255),
	`completed_on` timestamp,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `professional_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`website_url` varchar(255),
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `sponsors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sponsorship_offers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`sponsor_id` int NOT NULL,
	`user_id` int NOT NULL,
	`offer_type` varchar(255) NOT NULL,
	`reference_id` int NOT NULL,
	`offer_amount` decimal NOT NULL,
	`status` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `sponsorship_offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`is_email_verified` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`last_login_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `alumni_event_participation` ADD CONSTRAINT `alumni_event_participation_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alumni_profiles` ADD CONSTRAINT `alumni_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_key_permissions` ADD CONSTRAINT `api_key_permissions_api_key_id_api_keys_id_fk` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_key_usage` ADD CONSTRAINT `api_key_usage_api_key_id_api_keys_id_fk` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_client_id_api_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `api_clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bids` ADD CONSTRAINT `bids_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certifications` ADD CONSTRAINT `certifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `degrees` ADD CONSTRAINT `degrees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employment_history` ADD CONSTRAINT `employment_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_days` ADD CONSTRAINT `feature_days_winner_user_id_users_id_fk` FOREIGN KEY (`winner_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_days` ADD CONSTRAINT `feature_days_winning_bid_id_bids_id_fk` FOREIGN KEY (`winning_bid_id`) REFERENCES `bids`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `licenses` ADD CONSTRAINT `licenses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professional_courses` ADD CONSTRAINT `professional_courses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sponsorship_offers` ADD CONSTRAINT `sponsorship_offers_sponsor_id_sponsors_id_fk` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sponsorship_offers` ADD CONSTRAINT `sponsorship_offers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `target_day_idx` ON `bids` (`target_day`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bids` (`status`);--> statement-breakpoint
CREATE INDEX `day_idx` ON `feature_days` (`day`);