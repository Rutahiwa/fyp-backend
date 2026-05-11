-- Posts targeting system: groups, memberships, posts, audiences (cascade delete audiences with post)

CREATE TABLE IF NOT EXISTS "groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "type" varchar(30) NOT NULL,
  "parent_id" uuid REFERENCES "groups"("id"),
  "description" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "groups_type_idx" ON "groups" ("type");
CREATE INDEX IF NOT EXISTS "groups_parent_id_idx" ON "groups" ("parent_id");

CREATE TABLE IF NOT EXISTS "group_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "group_id" uuid NOT NULL REFERENCES "groups"("id"),
  "added_by" uuid REFERENCES "users"("id"),
  "joined_at" timestamp DEFAULT now() NOT NULL,
  "left_at" timestamp,
  "metadata" jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS "group_memberships_user_id_group_id_unique" ON "group_memberships" ("user_id", "group_id");
CREATE INDEX IF NOT EXISTS "group_memberships_user_id_idx" ON "group_memberships" ("user_id");
CREATE INDEX IF NOT EXISTS "group_memberships_group_id_idx" ON "group_memberships" ("group_id");
CREATE INDEX IF NOT EXISTS "group_memberships_left_at_idx" ON "group_memberships" ("left_at");

CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "author_id" uuid NOT NULL REFERENCES "users"("id"),
  "title" varchar(255),
  "content" text NOT NULL,
  "type" varchar(20) DEFAULT 'POST' NOT NULL,
  "status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
  "media_id" uuid REFERENCES "media"("id"),
  "is_pinned" boolean DEFAULT false NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "published_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE INDEX IF NOT EXISTS "posts_author_id_idx" ON "posts" ("author_id");
CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status");
CREATE INDEX IF NOT EXISTS "posts_deleted_at_idx" ON "posts" ("deleted_at");

CREATE TABLE IF NOT EXISTS "post_audiences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "target_type" varchar(30) NOT NULL,
  "college_id" uuid REFERENCES "colleges"("id"),
  "department_id" uuid REFERENCES "departments"("id"),
  "programme_id" uuid REFERENCES "programmes"("id"),
  "year_of_study" integer,
  "role_target" varchar(50),
  "group_id" uuid REFERENCES "groups"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "post_audiences_post_id_idx" ON "post_audiences" ("post_id");
CREATE INDEX IF NOT EXISTS "post_audiences_group_id_idx" ON "post_audiences" ("group_id");
CREATE INDEX IF NOT EXISTS "post_audiences_programme_id_idx" ON "post_audiences" ("programme_id");
CREATE INDEX IF NOT EXISTS "post_audiences_department_id_idx" ON "post_audiences" ("department_id");
CREATE INDEX IF NOT EXISTS "post_audiences_college_id_idx" ON "post_audiences" ("college_id");
