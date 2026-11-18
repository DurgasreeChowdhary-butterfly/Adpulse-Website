CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text,
	"phone" text,
	"email" text NOT NULL,
	"website" text,
	"service" text,
	"source_page" text,
	"status" text DEFAULT 'new' NOT NULL,
	"notification_status" text DEFAULT 'pending' NOT NULL,
	"notification_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"form" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enquiries_type_created_idx" ON "enquiries" USING btree ("type","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "enquiries_newsletter_active_email_key" ON "enquiries" USING btree ("email") WHERE "enquiries"."type" = 'newsletter' and "enquiries"."status" <> 'closed';--> statement-breakpoint
CREATE INDEX "enquiry_attempts_ip_created_idx" ON "enquiry_attempts" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "enquiry_attempts_created_idx" ON "enquiry_attempts" USING btree ("created_at");