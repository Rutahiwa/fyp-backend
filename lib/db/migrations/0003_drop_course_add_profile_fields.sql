ALTER TABLE "users" DROP COLUMN "course";
ALTER TABLE "users" ADD COLUMN "college_id" uuid REFERENCES "colleges"("id");
ALTER TABLE "users" ADD COLUMN "programme_id" uuid REFERENCES "programmes"("id");
ALTER TABLE "users" ADD COLUMN "year_of_study" integer;
ALTER TABLE "users" ADD COLUMN "current_semester" integer;
