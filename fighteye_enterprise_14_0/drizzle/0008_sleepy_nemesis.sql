CREATE TABLE `fitness_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`provider` text NOT NULL,
	`credential_ref` text,
	`status` text DEFAULT 'connected' NOT NULL,
	`permissions_json` text NOT NULL,
	`last_synced_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `fitness_connections_athlete_idx` ON `fitness_connections` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `preparation_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`competition_id` integer,
	`title` text NOT NULL,
	`start_date` text NOT NULL,
	`competition_date` text,
	`phase` text NOT NULL,
	`readiness_score` real,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `prep_plans_athlete_idx` ON `preparation_plans` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `private_health_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`metric_type` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`recorded_at` text NOT NULL,
	`source` text NOT NULL,
	`visibility` text DEFAULT 'athlete_only' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `health_metrics_athlete_idx` ON `private_health_metrics` (`athlete_id`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `ranking_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ranking_version_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`rank` integer NOT NULL,
	`rating` real NOT NULL,
	`verified_results_score` real NOT NULL,
	`opponent_quality_score` real NOT NULL,
	`event_level_score` real NOT NULL,
	`activity_score` real NOT NULL,
	`dominance_score` real NOT NULL,
	`explanation_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`ranking_version_id`) REFERENCES `ranking_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_entry_uq` ON `ranking_entries` (`ranking_version_id`,`athlete_id`);--> statement-breakpoint
CREATE INDEX `ranking_order_idx` ON `ranking_entries` (`ranking_version_id`,`rank`);--> statement-breakpoint
CREATE TABLE `ranking_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`scope` text NOT NULL,
	`discipline` text NOT NULL,
	`age_band` text NOT NULL,
	`weight_band` text NOT NULL,
	`formula_json` text NOT NULL,
	`results_cutoff` text NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_version_uq` ON `ranking_versions` (`version`,`scope`,`discipline`,`age_band`,`weight_band`);--> statement-breakpoint
CREATE TABLE `scouting_watchlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`club_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`added_by` text NOT NULL,
	`reason` text,
	`alerts_enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scouting_watch_uq` ON `scouting_watchlist` (`club_id`,`athlete_id`);--> statement-breakpoint
CREATE TABLE `training_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`connection_id` integer,
	`external_id` text,
	`session_type` text NOT NULL,
	`started_at` text NOT NULL,
	`duration_minutes` integer,
	`load_score` real,
	`intensity` real,
	`source` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`connection_id`) REFERENCES `fitness_connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `training_sessions_athlete_idx` ON `training_sessions` (`athlete_id`,`started_at`);