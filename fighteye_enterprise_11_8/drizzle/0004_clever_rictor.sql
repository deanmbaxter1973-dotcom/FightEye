CREATE TABLE `matchup_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`opponent_id` integer NOT NULL,
	`discipline` text NOT NULL,
	`verified_stats_json` text NOT NULL,
	`inferred_observations_json` text,
	`model_version` text,
	`generated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opponent_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `matchup_pair_idx` ON `matchup_reports` (`athlete_id`,`opponent_id`);--> statement-breakpoint
CREATE TABLE `training_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`source_video_tag_id` integer,
	`title` text NOT NULL,
	`prescription` text,
	`status` text DEFAULT 'assigned' NOT NULL,
	`assigned_by` text NOT NULL,
	`due_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_video_tag_id`) REFERENCES `video_tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `training_actions_athlete_idx` ON `training_actions` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `video_annotations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_tag_id` integer,
	`video_id` integer NOT NULL,
	`author_email` text NOT NULL,
	`annotation` text NOT NULL,
	`visibility` text DEFAULT 'coach_private' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_tag_id`) REFERENCES `video_tags`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `video_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`fight_id` integer,
	`at_seconds` real NOT NULL,
	`end_seconds` real,
	`tag_type` text NOT NULL,
	`label` text NOT NULL,
	`score_value` real,
	`created_by` text NOT NULL,
	`source_type` text DEFAULT 'coach' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `video_tags_video_time_idx` ON `video_tags` (`video_id`,`at_seconds`);