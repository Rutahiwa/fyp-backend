CREATE TABLE "lost_found_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reporter_id" uuid NOT NULL,
  "type" varchar(10) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "category_id" uuid,
  "location_seen" varchar(255),
  "status" varchar(20) DEFAULT 'OPEN' NOT NULL,
  "date_lost_or_found" date NOT NULL,
  "is_anonymous" boolean DEFAULT false NOT NULL,
  "contact_info" varchar(255),
  "view_count" integer DEFAULT 0 NOT NULL,
  "resolved_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE TABLE "lost_found_media" (
  "item_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  CONSTRAINT "lost_found_media_pk" PRIMARY KEY ("item_id", "media_id")
);

ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lost_found_media" ADD CONSTRAINT "lost_found_media_item_id_lost_found_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."lost_found_items"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lost_found_media" ADD CONSTRAINT "lost_found_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
