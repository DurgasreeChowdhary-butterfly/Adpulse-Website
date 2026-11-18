CREATE TABLE "content_documents" (
	"collection" text PRIMARY KEY NOT NULL,
	"data" json NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"collection" text NOT NULL,
	"position" integer NOT NULL,
	"slug" text,
	"status" text,
	"data" json NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_items_collection_position_pk" PRIMARY KEY("collection","position")
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection" text NOT NULL,
	"data" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_items_collection_slug_key" ON "content_items" USING btree ("collection","slug");--> statement-breakpoint
CREATE INDEX "content_items_collection_status_idx" ON "content_items" USING btree ("collection","status");--> statement-breakpoint
CREATE INDEX "content_revisions_collection_idx" ON "content_revisions" USING btree ("collection","id");