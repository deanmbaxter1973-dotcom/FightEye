CREATE TABLE `video_analysis_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`pipeline_version` text DEFAULT 'fighteye-video-v1' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`frame_count` integer DEFAULT 0 NOT NULL,
	`ocr_text` text,
	`metadata_json` text,
	`started_at` text,
	`completed_at` text,
	`error_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `video_jobs_video_idx` ON `video_analysis_jobs` (`video_id`);--> statement-breakpoint
CREATE INDEX `video_jobs_status_idx` ON `video_analysis_jobs` (`status`);--> statement-breakpoint
CREATE TABLE `video_detections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer NOT NULL,
	`field` text NOT NULL,
	`suggested_value` text NOT NULL,
	`matched_entity_id` integer,
	`confidence` real NOT NULL,
	`evidence_type` text NOT NULL,
	`evidence_text` text,
	`review_status` text DEFAULT 'suggested' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `video_analysis_jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `video_detections_job_idx` ON `video_detections` (`job_id`);--> statement-breakpoint
CREATE INDEX `video_detections_field_idx` ON `video_detections` (`field`);--> statement-breakpoint
CREATE TABLE `video_segments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer NOT NULL,
	`start_seconds` real NOT NULL,
	`end_seconds` real NOT NULL,
	`label` text NOT NULL,
	`confidence` real NOT NULL,
	`status` text DEFAULT 'suggested' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `video_segments_video_idx` ON `video_segments` (`video_id`);