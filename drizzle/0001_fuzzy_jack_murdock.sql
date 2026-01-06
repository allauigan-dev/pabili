CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` text,
	`type` text NOT NULL,
	`action` text NOT NULL,
	`entity_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text,
	`user_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_activities_org` ON `activities` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_activities_type` ON `activities` (`type`);--> statement-breakpoint
CREATE INDEX `idx_activities_date` ON `activities` (`created_at`);