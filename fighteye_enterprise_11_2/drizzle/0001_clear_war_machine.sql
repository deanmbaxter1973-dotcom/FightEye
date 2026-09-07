CREATE TABLE `scoring_criteria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rule_set_id` integer NOT NULL,
	`technique` text NOT NULL,
	`points` real,
	`target_area` text,
	`conditions` text,
	`prohibited` integer DEFAULT false NOT NULL,
	`evidence_status` text DEFAULT 'official' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rule_set_id`) REFERENCES `rule_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scoring_criteria_ruleset_idx` ON `scoring_criteria` (`rule_set_id`);--> statement-breakpoint
ALTER TABLE `rule_sets` ADD `source_url` text;--> statement-breakpoint
ALTER TABLE `rule_sets` ADD `verified_at` text;