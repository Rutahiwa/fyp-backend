-- College → department → programme hierarchy (UDSM). Indexes for FK lookups.

CREATE TABLE IF NOT EXISTS "departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "college_id" uuid NOT NULL REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
  "name" varchar(255) NOT NULL,
  "short_name" varchar(50) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "departments_college_short_name_uidx" ON "departments" ("college_id", "short_name");
CREATE INDEX IF NOT EXISTS "departments_college_id_idx" ON "departments" ("college_id");

-- Placeholder department per college for existing programmes
INSERT INTO "departments" ("college_id", "name", "short_name")
SELECT c."id", c."name" || ' — General Department', c."short_name" || '-GEN'
FROM "colleges" c
WHERE NOT EXISTS (
  SELECT 1 FROM "departments" d
  WHERE d."college_id" = c."id" AND d."short_name" = c."short_name" || '-GEN'
);

ALTER TABLE "programmes" ADD COLUMN IF NOT EXISTS "department_id" uuid REFERENCES "departments"("id");

UPDATE "programmes" p
SET "department_id" = d."id"
FROM "departments" d
INNER JOIN "colleges" c ON c."id" = d."college_id"
WHERE p."college_id" = c."id"
  AND d."short_name" = c."short_name" || '-GEN'
  AND p."department_id" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "programmes" WHERE "department_id" IS NULL) THEN
    RAISE EXCEPTION 'Migration 0012: programmes still missing department_id';
  END IF;
END $$;

ALTER TABLE "programmes" DROP COLUMN IF EXISTS "college_id";

ALTER TABLE "programmes" ALTER COLUMN "department_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "programmes_department_id_idx" ON "programmes" ("department_id");
CREATE INDEX IF NOT EXISTS "programmes_deleted_at_idx" ON "programmes" ("deleted_at");

CREATE INDEX IF NOT EXISTS "users_role_id_idx" ON "users" ("role_id");
CREATE INDEX IF NOT EXISTS "users_college_id_idx" ON "users" ("college_id");
CREATE INDEX IF NOT EXISTS "users_programme_id_idx" ON "users" ("programme_id");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users" ("deleted_at");
