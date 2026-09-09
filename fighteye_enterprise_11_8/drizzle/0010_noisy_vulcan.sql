CREATE TABLE `area_statuses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`area_code` text NOT NULL,
	`discipline` text NOT NULL,
	`current_fight_id` integer,
	`state` text DEFAULT 'not_started' NOT NULL,
	`delay_minutes` integer DEFAULT 0 NOT NULL,
	`status_message` text,
	`reported_by` text,
	`reported_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `event_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `area_status_session_uq` ON `area_statuses` (`session_id`,`area_code`);--> statement-breakpoint
CREATE INDEX `area_status_state_idx` ON `area_statuses` (`state`);--> statement-breakpoint
CREATE TABLE `competition_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`alert_type` text NOT NULL,
	`scope_type` text NOT NULL,
	`scope_ref` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`published_by` text NOT NULL,
	`published_at` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `event_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `competition_alert_scope_idx` ON `competition_alerts` (`session_id`,`scope_type`,`scope_ref`);--> statement-breakpoint
CREATE INDEX `competition_alert_priority_idx` ON `competition_alerts` (`priority`,`published_at`);--> statement-breakpoint
CREATE TABLE `device_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`device_ref_hash` text NOT NULL,
	`platform` text NOT NULL,
	`push_token_ref` text,
	`app_version` text,
	`last_seen_at` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_registration_uq` ON `device_registrations` (`device_ref_hash`);--> statement-breakpoint
CREATE INDEX `device_registration_user_idx` ON `device_registrations` (`user_email`);--> statement-breakpoint
CREATE TABLE `event_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competition_id` integer NOT NULL,
	`session_date` text NOT NULL,
	`opens_at` text,
	`closes_at` text,
	`timezone` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`command_lead` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_session_uq` ON `event_sessions` (`competition_id`,`session_date`);--> statement-breakpoint
CREATE INDEX `event_session_status_idx` ON `event_sessions` (`status`);--> statement-breakpoint
CREATE TABLE `offline_sync_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer NOT NULL,
	`scope_type` text NOT NULL,
	`scope_ref` text NOT NULL,
	`manifest_hash` text NOT NULL,
	`encrypted_object_key` text NOT NULL,
	`generated_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`downloaded_at` text,
	`revoked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `device_registrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `offline_sync_device_idx` ON `offline_sync_batches` (`device_id`);--> statement-breakpoint
CREATE INDEX `offline_sync_expiry_idx` ON `offline_sync_batches` (`expires_at`);--> statement-breakpoint
CREATE TABLE `running_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`fight_id` integer NOT NULL,
	`area_code` text NOT NULL,
	`sequence` integer NOT NULL,
	`estimated_at` text,
	`called_at` text,
	`started_at` text,
	`completed_at` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`source_version` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `event_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `running_order_fight_uq` ON `running_order_items` (`session_id`,`fight_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `running_order_position_uq` ON `running_order_items` (`session_id`,`area_code`,`sequence`);--> statement-breakpoint
CREATE INDEX `running_order_status_idx` ON `running_order_items` (`status`);--> statement-breakpoint
CREATE TABLE `secure_share_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` text NOT NULL,
	`athlete_id` integer,
	`resource_type` text NOT NULL,
	`resource_ref` text NOT NULL,
	`token_hash` text NOT NULL,
	`audience_json` text NOT NULL,
	`watermark` text,
	`allow_download` integer DEFAULT false NOT NULL,
	`max_views` integer,
	`view_count` integer DEFAULT 0 NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `secure_share_token_uq` ON `secure_share_links` (`token_hash`);--> statement-breakpoint
CREATE INDEX `secure_share_expiry_idx` ON `secure_share_links` (`expires_at`);--> statement-breakpoint
CREATE TABLE `team_checkins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`club_id` integer NOT NULL,
	`eligibility_check_id` integer,
	`weigh_in_kg` real,
	`equipment_status` text DEFAULT 'pending' NOT NULL,
	`checkin_status` text DEFAULT 'expected' NOT NULL,
	`checked_in_by` text,
	`checked_in_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `event_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`eligibility_check_id`) REFERENCES `eligibility_checks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_checkin_uq` ON `team_checkins` (`session_id`,`athlete_id`);--> statement-breakpoint
CREATE INDEX `team_checkin_club_idx` ON `team_checkins` (`session_id`,`club_id`);