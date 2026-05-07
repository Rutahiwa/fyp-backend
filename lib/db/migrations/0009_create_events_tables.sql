CREATE TABLE "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "category_id" uuid NOT NULL,
  "status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
  "organizer_id" uuid NOT NULL,
  "cover_image_id" uuid,
  "location" varchar(255),
  "location_url" varchar(500),
  "start_date_time" timestamp NOT NULL,
  "end_date_time" timestamp NOT NULL,
  "max_attendees" integer,
  "is_pinned" boolean DEFAULT false NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "published_at" timestamp,
  "academic_year_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "events_slug_unique" UNIQUE("slug")
);

CREATE TABLE "event_rsvps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "status" varchar(20) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "event_rsvps_event_id_user_id_unique" UNIQUE("event_id", "user_id")
);

ALTER TABLE "events" ADD CONSTRAINT "events_category_id_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
