CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`r2_key` text NOT NULL,
	`r2_url` text NOT NULL,
	`original_filename` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`width` integer,
	`height` integer,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`image_type` text DEFAULT 'primary' NOT NULL,
	`alt_text` text,
	`caption` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_r2_key_unique` ON `images` (`r2_key`);--> statement-breakpoint
CREATE INDEX `idx_images_entity` ON `images` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_images_r2_key` ON `images` (`r2_key`);--> statement-breakpoint
CREATE INDEX `idx_images_type` ON `images` (`image_type`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_number` text NOT NULL,
	`invoice_total` real DEFAULT 0 NOT NULL,
	`invoice_paid` real DEFAULT 0 NOT NULL,
	`invoice_notes` text,
	`due_date` text,
	`invoice_status` text DEFAULT 'draft' NOT NULL,
	`reseller_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	FOREIGN KEY (`reseller_id`) REFERENCES `resellers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `idx_invoices_reseller` ON `invoices` (`reseller_id`);--> statement-breakpoint
CREATE INDEX `idx_invoices_status` ON `invoices` (`invoice_status`);--> statement-breakpoint
CREATE INDEX `idx_invoices_due_date` ON `invoices` (`due_date`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`user_id` integer,
	`order_name` text NOT NULL,
	`order_description` text,
	`order_quantity` integer DEFAULT 1 NOT NULL,
	`order_image` text,
	`order_price` real NOT NULL,
	`order_fee` real DEFAULT 0 NOT NULL,
	`order_reseller_price` real NOT NULL,
	`order_total` real,
	`order_reseller_total` real,
	`order_status` text DEFAULT 'pending' NOT NULL,
	`order_date` text DEFAULT CURRENT_TIMESTAMP,
	`store_id` integer NOT NULL,
	`reseller_id` integer NOT NULL,
	`invoice_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reseller_id`) REFERENCES `resellers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`order_status`);--> statement-breakpoint
CREATE INDEX `idx_orders_reseller` ON `orders` (`reseller_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_store` ON `orders` (`store_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_date` ON `orders` (`order_date`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payment_amount` real NOT NULL,
	`payment_method` text DEFAULT 'cash' NOT NULL,
	`payment_reference` text,
	`payment_proof` text,
	`payment_notes` text,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_date` text DEFAULT CURRENT_TIMESTAMP,
	`reseller_id` integer NOT NULL,
	`invoice_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	FOREIGN KEY (`reseller_id`) REFERENCES `resellers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_payments_reseller` ON `payments` (`reseller_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_status` ON `payments` (`payment_status`);--> statement-breakpoint
CREATE INDEX `idx_payments_date` ON `payments` (`payment_date`);--> statement-breakpoint
CREATE TABLE `resellers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reseller_name` text NOT NULL,
	`reseller_address` text,
	`reseller_phone` text,
	`reseller_email` text,
	`reseller_photo` text,
	`reseller_description` text,
	`reseller_status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_resellers_status` ON `resellers` (`reseller_status`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_name` text NOT NULL,
	`store_address` text,
	`store_phone` text,
	`store_email` text,
	`store_logo` text,
	`store_cover` text,
	`store_description` text,
	`store_status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_stores_status` ON `stores` (`store_status`);