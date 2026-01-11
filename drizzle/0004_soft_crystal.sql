CREATE TABLE `shipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`organization_id` text,
	`shipment_number` text NOT NULL,
	`tracking_number` text NOT NULL,
	`carrier` text DEFAULT 'self' NOT NULL,
	`carrier_reference` text,
	`shipment_status` text DEFAULT 'preparing' NOT NULL,
	`shipping_fee` real DEFAULT 0,
	`shipment_photo` text,
	`notes` text,
	`customer_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipments_shipment_number_unique` ON `shipments` (`shipment_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `shipments_tracking_number_unique` ON `shipments` (`tracking_number`);--> statement-breakpoint
CREATE INDEX `idx_shipments_status` ON `shipments` (`shipment_status`);--> statement-breakpoint
CREATE INDEX `idx_shipments_customer` ON `shipments` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_shipments_tracking` ON `shipments` (`tracking_number`);--> statement-breakpoint
CREATE INDEX `idx_shipments_org` ON `shipments` (`organization_id`);--> statement-breakpoint
ALTER TABLE `orders` ADD `shipment_id` integer;