CREATE TABLE `athletes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_ref` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`display_name` text NOT NULL,
	`date_of_birth` text,
	`gender` text DEFAULT 'unknown' NOT NULL,
	`nationality` text,
	`club_id` integer,
	`grade` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `athletes_external_ref_uq` ON `athletes` (`external_ref`);--> statement-breakpoint
CREATE INDEX `athletes_name_idx` ON `athletes` (`last_name`,`first_name`);--> statement-breakpoint
CREATE INDEX `athletes_club_idx` ON `athletes` (`club_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_email` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`before_json` text,
	`after_json` text,
	`request_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`city` text,
	`country` text DEFAULT 'GB' NOT NULL,
	`contact_email` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_name_country_uq` ON `clubs` (`name`,`country`);--> statement-breakpoint
CREATE TABLE `competitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_ref` text,
	`organisation_id` integer,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`venue` text,
	`city` text,
	`country` text,
	`source_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `competitions_external_ref_uq` ON `competitions` (`external_ref`);--> statement-breakpoint
CREATE INDEX `competitions_date_idx` ON `competitions` (`start_date`);--> statement-breakpoint
CREATE TABLE `divisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competition_id` integer NOT NULL,
	`rule_set_id` integer,
	`discipline` text NOT NULL,
	`age_band` text NOT NULL,
	`gender` text NOT NULL,
	`min_weight_kg` real,
	`max_weight_kg` real,
	`grade_band` text,
	`label` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_set_id`) REFERENCES `rule_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `divisions_competition_idx` ON `divisions` (`competition_id`);--> statement-breakpoint
CREATE TABLE `duplicate_flags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`primary_id` integer NOT NULL,
	`candidate_id` integer NOT NULL,
	`confidence` real NOT NULL,
	`reasons_json` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`resolved_by` text,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `duplicate_pair_uq` ON `duplicate_flags` (`entity_type`,`primary_id`,`candidate_id`);--> statement-breakpoint
CREATE TABLE `fight_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fight_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`corner` text NOT NULL,
	`weigh_in_kg` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fight_corner_uq` ON `fight_participants` (`fight_id`,`corner`);--> statement-breakpoint
CREATE UNIQUE INDEX `fight_athlete_uq` ON `fight_participants` (`fight_id`,`athlete_id`);--> statement-breakpoint
CREATE TABLE `fights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_ref` text,
	`competition_id` integer NOT NULL,
	`division_id` integer NOT NULL,
	`round_label` text,
	`area` text,
	`scheduled_at` text,
	`completed_at` text,
	`winner_athlete_id` integer,
	`red_score` real,
	`blue_score` real,
	`outcome` text DEFAULT 'pending' NOT NULL,
	`method` text,
	`source_type` text DEFAULT 'manual' NOT NULL,
	`source_url` text,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`verified_by` text,
	`verified_at` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fights_external_ref_uq` ON `fights` (`external_ref`);--> statement-breakpoint
CREATE INDEX `fights_competition_idx` ON `fights` (`competition_id`);--> statement-breakpoint
CREATE INDEX `fights_division_idx` ON `fights` (`division_id`);--> statement-breakpoint
CREATE TABLE `organisations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`country` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organisations_code_uq` ON `organisations` (`code`);--> statement-breakpoint
CREATE TABLE `rule_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organisation_id` integer,
	`name` text NOT NULL,
	`discipline` text NOT NULL,
	`version` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`role` text NOT NULL,
	`club_id` integer,
	`athlete_id` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_roles_email_idx` ON `user_roles` (`user_email`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fight_id` integer,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`duration_seconds` real,
	`checksum` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`processing_status` text DEFAULT 'uploaded' NOT NULL,
	`uploaded_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `videos_object_key_uq` ON `videos` (`object_key`);--> statement-breakpoint
CREATE INDEX `videos_fight_idx` ON `videos` (`fight_id`);