DROP INDEX `organization_slug_unique`;--> statement-breakpoint
ALTER TABLE `organization` ADD `created_by` text REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `idx_organization_created_by` ON `organization` (`created_by`);