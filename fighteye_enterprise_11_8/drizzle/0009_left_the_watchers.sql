CREATE TABLE `eligibility_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`competition_id` integer NOT NULL,
	`division_id` integer,
	`licence_id` integer,
	`checks_json` text NOT NULL,
	`result` text NOT NULL,
	`checked_by` text NOT NULL,
	`checked_at` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`division_id`) REFERENCES `divisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`licence_id`) REFERENCES `member_licences`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `eligibility_check_uq` ON `eligibility_checks` (`athlete_id`,`competition_id`,`division_id`);--> statement-breakpoint
CREATE INDEX `eligibility_result_idx` ON `eligibility_checks` (`result`);--> statement-breakpoint
CREATE TABLE `event_sanctions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competition_id` integer NOT NULL,
	`organisation_id` integer NOT NULL,
	`application_ref` text NOT NULL,
	`rule_set_ids_json` text NOT NULL,
	`insurance_status` text NOT NULL,
	`safeguarding_status` text NOT NULL,
	`decision` text DEFAULT 'draft' NOT NULL,
	`decided_by` text,
	`decided_at` text,
	`decision_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_sanction_application_uq` ON `event_sanctions` (`application_ref`);--> statement-breakpoint
CREATE INDEX `event_sanction_competition_idx` ON `event_sanctions` (`competition_id`);--> statement-breakpoint
CREATE TABLE `federation_memberships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organisation_id` integer NOT NULL,
	`athlete_id` integer,
	`club_id` integer,
	`member_number` text NOT NULL,
	`member_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`joined_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `federation_member_number_uq` ON `federation_memberships` (`organisation_id`,`member_number`);--> statement-breakpoint
CREATE INDEX `federation_member_athlete_idx` ON `federation_memberships` (`athlete_id`);--> statement-breakpoint
CREATE TABLE `member_licences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`membership_id` integer NOT NULL,
	`licence_type` text NOT NULL,
	`licence_number` text NOT NULL,
	`valid_from` text NOT NULL,
	`expires_at` text NOT NULL,
	`verification_token_hash` text NOT NULL,
	`status` text DEFAULT 'valid' NOT NULL,
	`issued_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`membership_id`) REFERENCES `federation_memberships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_licence_number_uq` ON `member_licences` (`licence_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `member_licence_token_uq` ON `member_licences` (`verification_token_hash`);--> statement-breakpoint
CREATE INDEX `member_licence_expiry_idx` ON `member_licences` (`expires_at`);--> statement-breakpoint
CREATE TABLE `official_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competition_id` integer NOT NULL,
	`credential_id` integer NOT NULL,
	`role` text NOT NULL,
	`area` text,
	`conflict_check_json` text NOT NULL,
	`conflict_status` text NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`assigned_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`credential_id`) REFERENCES `official_credentials`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `official_assignment_uq` ON `official_assignments` (`competition_id`,`credential_id`,`role`,`area`);--> statement-breakpoint
CREATE TABLE `official_credentials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`membership_id` integer NOT NULL,
	`discipline` text NOT NULL,
	`grade` text NOT NULL,
	`valid_from` text NOT NULL,
	`expires_at` text NOT NULL,
	`evidence_object_key` text,
	`verified_by` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`membership_id`) REFERENCES `federation_memberships`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `official_credential_member_idx` ON `official_credentials` (`membership_id`);--> statement-breakpoint
CREATE INDEX `official_credential_expiry_idx` ON `official_credentials` (`expires_at`);--> statement-breakpoint
CREATE TABLE `operations_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organisation_id` integer,
	`notification_type` text NOT NULL,
	`recipient_ref` text NOT NULL,
	`channel` text NOT NULL,
	`payload_json` text NOT NULL,
	`scheduled_at` text,
	`sent_at` text,
	`delivery_status` text DEFAULT 'queued' NOT NULL,
	`dedupe_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operations_notification_dedupe_uq` ON `operations_notifications` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `operations_notification_status_idx` ON `operations_notifications` (`delivery_status`,`scheduled_at`);--> statement-breakpoint
CREATE TABLE `regulatory_restrictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`organisation_id` integer NOT NULL,
	`restriction_type` text NOT NULL,
	`public_status` text NOT NULL,
	`protected_reason` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text,
	`clearance_evidence_object_key` text,
	`cleared_by` text,
	`cleared_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `restriction_athlete_active_idx` ON `regulatory_restrictions` (`athlete_id`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE TABLE `selection_decisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organisation_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`competition_id` integer,
	`discipline` text NOT NULL,
	`stage` text NOT NULL,
	`evidence_json` text NOT NULL,
	`panel_json` text NOT NULL,
	`reason` text NOT NULL,
	`decided_at` text NOT NULL,
	`appeal_deadline` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `selection_athlete_idx` ON `selection_decisions` (`athlete_id`);--> statement-breakpoint
CREATE INDEX `selection_competition_idx` ON `selection_decisions` (`competition_id`);