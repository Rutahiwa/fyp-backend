CREATE TABLE "stories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "author_id" uuid NOT NULL,
  "college_id" uuid,
  "media_id" uuid,
  "caption" varchar(500),
  "background_color" varchar(7),
  "link_url" varchar(500),
  "link_text" varchar(100),
  "view_count" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE TABLE "story_views" (
  "story_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "viewed_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "story_views_pk" PRIMARY KEY ("story_id", "user_id")
);

ALTER TABLE "stories" ADD CONSTRAINT "stories_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stories" ADD CONSTRAINT "stories_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stories" ADD CONSTRAINT "stories_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
