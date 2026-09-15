CREATE TABLE `athlete_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`competition_id` integer,
	`season` integer NOT NULL,
	`discipline` text NOT NULL,
	`medal` text DEFAULT 'none' NOT NULL,
	`title` text,
	`source_url` text,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `athlete_achievements_athlete_idx` ON `athlete_achievements` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `athlete_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`title` text NOT NULL,
	`target_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `athlete_goals_athlete_idx` ON `athlete_goals` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `athlete_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`author_email` text NOT NULL,
	`note` text NOT NULL,
	`visibility` text DEFAULT 'coach_private' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `athlete_notes_athlete_idx` ON `athlete_notes` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `verification_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer NOT NULL,
	`status` text DEFAULT 'needs_review' NOT NULL,
	`reviewer_email` text,
	`decision_note` text,
	`official_evidence_url` text,
	`verified_fight_id` integer,
	`decided_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `video_analysis_jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `verification_reviews_status_idx` ON `verification_reviews` (`status`);--> statement-breakpoint
CREATE INDEX `verification_reviews_job_idx` ON `verification_reviews` (`job_id`);