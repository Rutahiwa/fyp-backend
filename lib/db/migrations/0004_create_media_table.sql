CREATE TABLE "media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "uploaded_by" uuid NOT NULL,
  "url" varchar(500) NOT NULL,
  "type" varchar(10) NOT NULL,
  "mime_type" varchar(100) NOT NULL,
  "size_bytes" integer NOT NULL,
  "filename" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
