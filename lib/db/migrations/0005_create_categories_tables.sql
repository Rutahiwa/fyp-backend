CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "slug" varchar(100) NOT NULL,
  "module" varchar(20) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
CREATE TABLE "event_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "slug" varchar(100) NOT NULL,
  "icon_name" varchar(50),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "event_categories_slug_unique" UNIQUE("slug")
);
