CREATE TABLE `youtube_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`club_id` integer,
	`channel_id` text NOT NULL,
	`channel_title` text NOT NULL,
	`token_ref` text NOT NULL,
	`scope` text NOT NULL,
	`status` text DEFAULT 'connected' NOT NULL,
	`last_synced_at` text,
	`connected_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `youtube_channel_uq` ON `youtube_connections` (`channel_id`);--> statement-breakpoint
CREATE TABLE `youtube_video_matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`youtube_video_id` integer NOT NULL,
	`fight_id` integer,
	`athlete_id` integer,
	`competition_id` integer,
	`confidence` real NOT NULL,
	`evidence_json` text NOT NULL,
	`status` text DEFAULT 'suggested' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`youtube_video_id`) REFERENCES `youtube_videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fight_id`) REFERENCES `fights`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `youtube_match_video_idx` ON `youtube_video_matches` (`youtube_video_id`);--> statement-breakpoint
CREATE TABLE `youtube_videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`connection_id` integer,
	`youtube_video_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`published_at` text,
	`duration_seconds` real,
	`privacy_status` text DEFAULT 'unknown' NOT NULL,
	`embeddable` integer DEFAULT false NOT NULL,
	`license` text,
	`thumbnail_url` text,
	`source_url` text NOT NULL,
	`metadata_hash` text,
	`last_fetched_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`connection_id`) REFERENCES `youtube_connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `youtube_video_id_uq` ON `youtube_videos` (`youtube_video_id`);--> statement-breakpoint
CREATE INDEX `youtube_video_channel_idx` ON `youtube_videos` (`channel_id`);