CREATE TABLE "announcements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "excerpt" varchar(500),
  "type" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
  "author_id" uuid NOT NULL,
  "category_id" uuid,
  "cover_image_id" uuid,
  "is_pinned" boolean DEFAULT false NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "published_at" timestamp,
  "academic_year_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "announcements_slug_unique" UNIQUE("slug")
);

CREATE TABLE "announcement_audiences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "announcement_id" uuid NOT NULL,
  "target_type" varchar(20) NOT NULL,
  "college_id" uuid,
  "programme_id" uuid,
  "year_of_study" integer,
  "semester" integer,
  "role_target" varchar(50),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "announcement_media" (
  "announcement_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  CONSTRAINT "announcement_media_pk" PRIMARY KEY ("announcement_id", "media_id")
);

ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcement_audiences" ADD CONSTRAINT "announcement_audiences_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcement_audiences" ADD CONSTRAINT "announcement_audiences_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcement_audiences" ADD CONSTRAINT "announcement_audiences_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcement_media" ADD CONSTRAINT "announcement_media_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcement_media" ADD CONSTRAINT "announcement_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
