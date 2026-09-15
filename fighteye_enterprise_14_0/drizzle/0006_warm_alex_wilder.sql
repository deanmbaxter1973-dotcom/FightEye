CREATE TABLE `finding_evidence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`finding_id` integer NOT NULL,
	`video_tag_id` integer,
	`start_seconds` real NOT NULL,
	`end_seconds` real,
	`observed_action` text NOT NULL,
	`legality_status` text NOT NULL,
	`score_value` real,
	`confidence` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`finding_id`) REFERENCES `performance_findings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`video_tag_id`) REFERENCES `video_tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `finding_evidence_finding_idx` ON `finding_evidence` (`finding_id`);--> statement-breakpoint
CREATE TABLE `performance_analyses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`rule_set_id` integer NOT NULL,
	`division_id` integer,
	`event_rules_object_key` text,
	`model_version` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`overall_confidence` real,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_set_id`) REFERENCES `rule_sets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `performance_analysis_video_idx` ON `performance_analyses` (`video_id`);--> statement-breakpoint
CREATE INDEX `performance_analysis_athlete_idx` ON `performance_analyses` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `performance_findings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`analysis_id` integer NOT NULL,
	`finding_type` text NOT NULL,
	`metric` text NOT NULL,
	`score` real,
	`evidence_count` integer DEFAULT 0 NOT NULL,
	`rule_criterion_id` integer,
	`summary` text NOT NULL,
	`confidence` real NOT NULL,
	`coach_status` text DEFAULT 'suggested' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`analysis_id`) REFERENCES `performance_analyses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_criterion_id`) REFERENCES `scoring_criteria`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `performance_findings_analysis_idx` ON `performance_findings` (`analysis_id`);