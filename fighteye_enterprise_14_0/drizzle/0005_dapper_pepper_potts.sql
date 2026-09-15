CREATE TABLE `external_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`connection_id` integer NOT NULL,
	`entity_type` text NOT NULL,
	`external_id` text NOT NULL,
	`source_url` text,
	`payload_hash` text NOT NULL,
	`payload_json` text NOT NULL,
	`fetched_at` text NOT NULL,
	`matched_entity_id` integer,
	`match_status` text DEFAULT 'unmatched' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`connection_id`) REFERENCES `platform_connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `external_record_uq` ON `external_records` (`connection_id`,`entity_type`,`external_id`);--> statement-breakpoint
CREATE INDEX `external_record_match_idx` ON `external_records` (`match_status`);--> statement-breakpoint
CREATE TABLE `media_consents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`guardian_name` text NOT NULL,
	`guardian_email` text,
	`relationship` text,
	`allow_storage` integer DEFAULT false NOT NULL,
	`allow_analysis` integer DEFAULT false NOT NULL,
	`allow_sharing` integer DEFAULT false NOT NULL,
	`valid_from` text NOT NULL,
	`expires_at` text,
	`withdrawn_at` text,
	`evidence_object_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `media_consents_athlete_idx` ON `media_consents` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `media_policy_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer,
	`athlete_id` integer,
	`event_type` text NOT NULL,
	`reason` text NOT NULL,
	`actor_email` text,
	`policy_version` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `media_policy_events_video_idx` ON `media_policy_events` (`video_id`);--> statement-breakpoint
CREATE INDEX `media_policy_events_athlete_idx` ON `media_policy_events` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `platform_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`club_id` integer,
	`platform` text NOT NULL,
	`status` text DEFAULT 'connected' NOT NULL,
	`credential_ref` text,
	`last_synced_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `platform_connections_club_idx` ON `platform_connections` (`club_id`);--> statement-breakpoint
CREATE TABLE `reconciliation_decisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_record_id` integer NOT NULL,
	`fight_id` integer,
	`field` text NOT NULL,
	`previous_value` text,
	`official_value` text,
	`decision` text NOT NULL,
	`decided_by` text NOT NULL,
	`reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`external_record_id`) REFERENCES `external_records`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action
);
