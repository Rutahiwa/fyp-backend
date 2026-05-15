-- Add scope column to permissions table
-- scope: 'portal' = admin panel permissions, 'app' = mobile/web app permissions
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "scope" varchar(20) NOT NULL DEFAULT 'app';

-- Tag portal permissions (admin panel only)
UPDATE "permissions" SET "scope" = 'portal' WHERE "name" IN (
  'user.create', 'user.read', 'user.update', 'user.delete',
  'role.create', 'role.read', 'role.update', 'role.delete',
  'permission.read',
  'college.read', 'college.manage',
  'programme.manage',
  'academic_year.manage',
  'assignment.manage',
  'audit.read'
);

-- All others remain 'app' (the default):
-- announcement.*, story.*, event.*, lostfound.*, feedback.*, post.*, group.*
