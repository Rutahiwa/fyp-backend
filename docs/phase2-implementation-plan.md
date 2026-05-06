# Phase 2 — Full Implementation Plan
## UDSM Information Dissemination Platform Backend

> [!NOTE]
> No code execution until this document is agreed upon. This is the master plan.

---

## Overview of Sub-Phases

| Sub-Phase | Name | Depends On |
| :--- | :--- | :--- |
| 2.0 | Foundation: Colleges | Phase 1 (IAM — done) |
| 2.1 | Foundation: Programmes & Academic Years | 2.0 |
| 2.2 | User Profile & Verified Email Change | 2.1 |
| 2.3 | Media Upload (Supabase Storage) | 2.1 |
| 2.4 | Categories | 2.1 |
| 2.5 | Announcements | 2.2, 2.3, 2.4 |
| 2.6 | Comments & Reactions | 2.5 |
| 2.7 | Stories | 2.3 |
| 2.8 | Events | 2.3, 2.4 |
| 2.9 | Lost & Found | 2.3, 2.4, 2.6 |
| 2.10 | Push Notifications (FCM) | 2.5, 2.7, 2.8 |
| 2.11 | Feedback Module | 2.4, 2.6 |
| 2.12 | Final: OpenAPI Spec & Seed Update | All above |

---

## Sub-Phase 2.0 — Foundation: Colleges

**Goal**: Setup the college hierarchy.

### Tasks:
1. Create `lib/db/schema/colleges.ts`.
2. Export from `lib/db/schema/index.ts`.
3. Run `db:push`.
4. Update `lib/db/seed.ts` to include hardcoded colleges:
   - CoICT, UDBS, CoSS, CoNAS, CoHU, CoAF, CoET.
5. Build API routes:
   - `GET /api/colleges`
   - `POST /api/colleges` (admin only)

### Git Commits:
```
feat: add colleges schema and hardcoded seed data
```

---

## Sub-Phase 2.1 — Foundation: Programmes & Academic Years

**Goal**: Establish the university structure data so all content modules can reference it.

### Tasks:
1. Create `lib/db/schema/programmes.ts` — the `programmes` table.
2. Create `lib/db/schema/academic-years.ts` — the `academic_years` table. Include a unique constraint so only ONE row has `isCurrent = true`.
3. Create `lib/db/schema/lecturer-assignments.ts` — the `lecturer_class_assignments` table linking a lecturer to a programme+year+semester+subject.
4. Create `lib/db/schema/cr-assignments.ts` — the `cr_assignments` table. Enforce max 2 CRs per programme+year+academic_year at the application layer.
5. Export all new schemas from `lib/db/schema/index.ts`.
6. Run `db:push` to sync the new tables to Supabase.
7. Build API routes:
   - `app/api/programmes/route.ts` → GET (list), POST (create — admin only)
   - `app/api/programmes/[id]/route.ts` → GET (one), PUT (update), DELETE (soft delete)
   - `app/api/academic-years/route.ts` → GET (list), POST (create — admin only)
   - `app/api/academic-years/current/route.ts` → GET (returns current year)
   - `app/api/academic-years/[id]/route.ts` → GET, PUT
   - `app/api/academic-years/[id]/set-current/route.ts` → POST (admin only — sets isCurrent=true, flips all others to false)
   - `app/api/lecturer-assignments/route.ts` → GET (list), POST (create — admin only)
   - `app/api/lecturer-assignments/[id]/route.ts` → DELETE
   - `app/api/cr-assignments/route.ts` → GET (list), POST (create — admin only, enforce 2-per-class rule)
   - `app/api/cr-assignments/[id]/route.ts` → DELETE

### New Permissions to add:
- `programme.manage` (admin)
- `academic_year.manage` (admin)
- `assignment.manage` (admin)

### Git Commits (after each working feature):
```
feat: add programmes schema and CRUD API
feat: add academic years schema with current-year enforcement
feat: add lecturer class assignment schema and API
feat: add class representative assignment schema and API
```

---

## Sub-Phase 2.2 — User Profile & Verified Email Change

**Goal**: Expand user profile, update registration, and implement secure email change.

### Tasks:
1. **Remove `course` field, add new fields** to `users` schema: `collegeId`, `programmeId`, `yearOfStudy`, `currentSemester`. Run `db:push`.
2. **Update `lib/validators/auth.ts`**: Remove `course` from `registerSchema`. Add `programmeId` (uuid), `yearOfStudy` (number 1-5).
3. **Update `POST /api/auth/register`**: Auto-assign `student` role by looking up the role from DB — never accept `roleId` from request body.
4. **Create `lib/utils/slug.ts`**: A shared utility that generates URL-safe slugs from text and ensures uniqueness by appending a short random suffix if a collision is detected. Used by announcements and events.
5. Update `PUT /api/users/[id]` to allow updating `collegeId`, `programmeId`, `yearOfStudy`, `currentSemester`.
6. **Verified Email Change Flow**:
   - `app/api/auth/change-email-request/route.ts`: Validate new email is not already taken, generate OTP, send to **new** email.
   - `app/api/auth/change-email-verify/route.ts`: Verify OTP, double-check email not taken, update email in DB.
7. Add new roles to seed: `lecturer`, `class_representative`.

### Git Commits:
```
feat: remove course field, add college/programme/year to users schema
feat: add slug generation utility
feat: update registration to auto-assign student role with programme/year
feat: implement verified email change with OTP verification
feat: add lecturer and class_representative roles
```

---

## Sub-Phase 2.3 — Media Upload (Supabase Storage)

**Goal**: Provide a single upload endpoint that all modules use to attach images, videos, and files.

### Tasks:
1. In Supabase dashboard: create a Storage bucket named `platform-media`. Set it to **private** (the backend generates signed URLs).
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and `.env.example`.
3. Install Supabase client: `npm install @supabase/supabase-js`.
4. Create `lib/storage/index.ts` — initialize Supabase client with service role key.
5. Create `lib/db/schema/media.ts` — the `media` table.
6. Export from `lib/db/schema/index.ts`.
7. Run `db:push`.
8. Build `app/api/media/upload/route.ts`:
   - Accepts `multipart/form-data` with a `file` field.
   - Validates file type (images, video, PDF only) and size (max 10MB).
   - Uploads to Supabase Storage using the service role key.
   - Saves a record to the `media` table.
   - Returns `{ id, url, type, mimeType, sizeBytes }`.

### New Env Variables:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
MAX_FILE_SIZE_MB=10
```

### Git Commits:
```
feat: add media schema and Supabase Storage upload endpoint
chore: add Supabase storage env variables to .env.example
```

---

## Sub-Phase 2.4 — Categories

**Goal**: Provide category/tagging infrastructure for announcements, events, and lost & found.

### Tasks:
1. Create `lib/db/schema/categories.ts` — the `categories` table (for announcements and L&F).
2. Create `lib/db/schema/event-categories.ts` — the `event_categories` table (for events with icon support).
3. Export both from schema index.
4. Run `db:push`.
5. Build `app/api/categories/route.ts` → GET (list all, filterable by `module`), POST (admin only).
6. Build `app/api/event-categories/route.ts` → GET (list all), POST (admin only).
7. Update seed to insert default categories:
   - Announcements: "Academic", "Administrative", "Health", "Finance", "General"
   - Events: "Academic", "Sports", "Religious", "Career", "Cultural", "Social"
   - Lost & Found: "Electronics", "Documents", "Clothing", "Keys", "Books", "Other"
   - Feedback: "Academic Issues", "Facilities", "Administration", "Student Welfare", "Other"

### Git Commits:
```
feat: add categories and event-categories schemas
feat: add categories API endpoints
feat: seed default categories for all modules
```

---

## Sub-Phase 2.5 — Announcements

**Goal**: The core feature of the platform. Targeted announcements with audience rules.

### Tasks:
1. Create `lib/db/schema/announcements.ts` — the `announcements` table.
2. Create `lib/db/schema/announcement-audiences.ts` — the `announcement_audiences` junction table.
3. Create `lib/db/schema/announcement-media.ts` — the `announcement_media` junction table.
4. Export all from schema index. Run `db:push`.
5. Create `lib/validators/announcements.ts` — Zod schemas for create/update.
6. Build API routes:
   - `app/api/announcements/route.ts`:
     - `GET`: Returns feed filtered by the authenticated user's role, programmeId, yearOfStudy. Pinned posts appear first. Supports `page`, `pageSize`, `search`, `type`, `categoryId` query params.
     - `POST`: Create announcement (checks `announcement.create` permission). Auto-generates slug from title. Sets `publishedAt` when status is PUBLISHED. Accepts `audiences` array in body.
   - `app/api/announcements/[id]/route.ts`:
     - `GET`: Single announcement + incrementing viewCount.
     - `PUT`: Update (permission + owner check).
     - `DELETE`: Soft delete (`announcement.delete`).
   - `app/api/announcements/[id]/pin/route.ts`:
     - `POST`: Toggle `isPinned` (admin only).

### Feed Filtering Logic (Critical):
The `GET /announcements` endpoint must apply this logic using a LEFT JOIN on `announcement_audiences`:
- `targetType = "ALL"` → shown to every authenticated user.
- `targetType = "COLLEGE"` → shown if user's `collegeId` matches.
- `targetType = "PROGRAMME"` → shown if user's `programmeId` matches.
- `targetType = "PROGRAMME_YEAR"` → shown if user's `programmeId` + `yearOfStudy` both match.
- `targetType = "ROLE"` → shown if user's role name matches `roleTarget`.
- Admin/staff see ALL announcements, bypassing all audience checks.

`GET /announcements?isForYou=true` → ONLY returns `PROGRAMME_YEAR` audience rows matching the user's class. No `ALL` or `COLLEGE` posts included.

### New Permissions:
`announcement.create`, `announcement.update`, `announcement.delete`, `announcement.pin`

### Git Commits:
```
feat: add announcements schema with audience targeting tables
feat: add announcement CRUD API with role-based feed filtering
feat: add announcement pin/unpin endpoint
```

---

## Sub-Phase 2.6 — Comments & Reactions

**Goal**: Add inline engagement to announcements, events, and lost & found.

### Tasks:
1. Create `lib/db/schema/comments.ts` — flat comments table with `targetId` + `targetType`.
2. Create `lib/db/schema/reactions.ts` — reactions table with unique constraint.
3. Export from schema index. Run `db:push`.
4. Build shared comment endpoints (wired to each parent module):
   - `GET /api/announcements/[id]/comments` → list comments, newest first.
   - `POST /api/announcements/[id]/comments` → create comment (JWT required, user must be valid audience).
   - `DELETE /api/announcements/[id]/comments/[commentId]` → soft delete (owner or admin).
   - Same pattern for `/events/[id]/comments` and `/lost-found/[id]/comments`.
5. Build reaction endpoints:
   - `POST /api/announcements/[id]/reactions` → toggle like (add if not exists, remove if exists — idempotent).
   - Same pattern for events and lost & found.

### Git Commits:
```
feat: add comments schema (flat, polymorphic)
feat: add reactions schema with unique constraint
feat: add comment and reaction endpoints for announcements
feat: add comment and reaction endpoints for events and lost-found
```

---

## Sub-Phase 2.7 — Stories

**Goal**: Short-lived 24-hour visual content from admin/staff.

### Tasks:
1. Create `lib/db/schema/stories.ts` — stories table.
2. Create `lib/db/schema/story-views.ts` — story_views junction table.
3. Export from schema index. Run `db:push`.
4. Build API routes:
   - `GET /api/stories` → list non-expired (`expiresAt > now()`) and non-deleted stories. Returns `hasViewed` flag and `collegeName` (resolved from `collegeId`).
   - `POST /api/stories` → create story. Accepts `collegeId` in body. Backend auto-sets `expiresAt = createdAt + 24h`. Requires `story.create` permission.
   - `POST /api/stories/[id]/view` → upsert a row in story_views for the current user.
   - `DELETE /api/stories/[id]` → soft delete (admin only, `story.delete` permission).

### Git Commits:
```
feat: add stories schema with auto-expiry logic
feat: add stories CRUD and view-tracking endpoints
```

---

## Sub-Phase 2.8 — Events

**Goal**: University events with RSVP and category-based filtering.

### Tasks:
1. Create `lib/db/schema/events.ts` — events table.
2. Create `lib/db/schema/event-rsvps.ts` — event_rsvps table.
3. Export from schema index. Run `db:push`.
4. Create `lib/validators/events.ts`.
5. Build API routes:
   - `GET /api/events` → list published events (all users). Supports filtering by `categoryId`, `status`, `upcoming` (startDateTime > now). Paginated.
   - `GET /api/events/[id]` → single event + RSVP count breakdown.
   - `POST /api/events` → create event (`event.create`).
   - `PUT /api/events/[id]` → update.
   - `DELETE /api/events/[id]` → soft delete.
   - `POST /api/events/[id]/rsvp` → create/update RSVP. If `status = "GOING"` and maxAttendees is set, check current count before allowing.
   - `DELETE /api/events/[id]/rsvp` → remove RSVP.
   - `GET /api/events/[id]/attendees` → list users going (admin only).

### Git Commits:
```
feat: add events schema and event-categories schema
feat: add events CRUD API with attendee cap enforcement
feat: add RSVP endpoints with max-attendee validation
```

---

## Sub-Phase 2.9 — Lost & Found

**Goal**: Student-driven item reporting with anonymous mode and admin moderation.

### Tasks:
1. Create `lib/db/schema/lost-found.ts` — lost_found_items table.
2. Create `lib/db/schema/lost-found-media.ts` — junction table.
3. Export from schema index. Run `db:push`.
4. Create `lib/validators/lost-found.ts`.
5. Build API routes:
   - `GET /api/lost-found` → list items. Filterable by `type` (LOST/FOUND), `status`, `categoryId`. If `isAnonymous=true`, strip `reporterId` from response for non-admins.
   - `GET /api/lost-found/[id]` → single item (same anonymity rule).
   - `POST /api/lost-found` → any authenticated user can report.
   - `PUT /api/lost-found/[id]` → owner or admin can update.
   - `POST /api/lost-found/[id]/resolve` → mark as RESOLVED (owner or admin).
   - `DELETE /api/lost-found/[id]` → soft delete (owner or admin with `lostfound.moderate`).

### Git Commits:
```
feat: add lost-and-found schema
feat: add lost-and-found CRUD API with anonymity enforcement
feat: add resolve endpoint for lost-and-found items
```

---

## Sub-Phase 2.10 — Push Notifications (Firebase FCM)

**Goal**: Real-time push alerts to Flutter app via Firebase.

### Tasks:
1. Create Firebase project → get `serviceAccountKey.json`. Store it securely (DO NOT commit to git — add to `.gitignore`).
2. Add to `.env.local`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
3. Install `firebase-admin` package: `npm install firebase-admin`.
4. Create `lib/firebase/index.ts` — initialize Firebase Admin SDK.
5. Create `lib/notifications/send.ts` — a reusable `sendPushNotification(userId, title, body, data)` helper that:
   - Looks up the user's FCM token(s) from `notification_tokens`.
   - Calls Firebase Admin to send the message.
   - Saves a record to the `notifications` inbox table.
6. Create schemas:
   - `lib/db/schema/notification-tokens.ts`
   - `lib/db/schema/notifications.ts`
   - `lib/db/schema/notification-preferences.ts`
7. Run `db:push`.
8. Build API routes:
   - `POST /api/notifications/token` → register device FCM token (JWT required). Upsert based on `fcmToken`.
   - `GET /api/notifications` → user's notification inbox (paginated).
   - `PUT /api/notifications/[id]/read` → mark one as read.
   - `PUT /api/notifications/read-all` → mark all as read.
   - `GET /api/notifications/preferences` → get user's preferences.
   - `PUT /api/notifications/preferences` → update preferences + event category choices.
9. Wire push notifications into existing endpoints:
   - When `POST /announcements` publishes → resolve audience users → call `sendPushNotification` for each.
   - When `POST /events` publishes → call `sendPushNotification` for all users, filtered by their event category preferences.
   - When `POST /stories` is created → notify all active users.

> [!IMPORTANT]
> **FCM Fan-out must be async (fire-and-forget).** Looking up all tokens and calling Firebase for hundreds of users inside a synchronous API handler will cause timeouts. Use `Promise.allSettled()` after sending the HTTP response. Do NOT await the notification sending before returning the API response.

### Git Commits:
```
feat: add Firebase Admin SDK integration
feat: add notification-tokens, notifications, and preferences schemas
feat: add FCM token registration and notification inbox APIs
feat: wire push notifications into announcement publishing flow
feat: wire push notifications into event publishing flow
feat: wire push notifications into story creation flow
```

---

## Sub-Phase 2.11 — Feedback Module

**Goal**: Allow students to submit issues to university officials.

### Tasks:
1. Create `lib/db/schema/feedback.ts`.
2. Export from index, run `db:push`.
3. Add `feedback.submit` and `feedback.manage` permissions to seed.
4. Build API routes:
   - `POST /api/feedback` (any JWT user)
   - `GET /api/feedback` (JWT — returns only the current user's own submissions)
   - `GET /api/admin/feedback` (`feedback.manage` — returns all submissions, filterable by status)
   - `PUT /api/admin/feedback/[id]` (`feedback.manage` — update `status` and `adminNotes`)
5. Feedback categories are seeded in Sub-Phase 2.4 (module = "FEEDBACK").

> Note: `POST /api/notifications/token` should **upsert** by `userId + deviceType` — if a token already exists for this user+device combo, update it. Do not create duplicates.

### Git Commits:
```
feat: add feedback schema and submission API
feat: add admin feedback management API
```

---

## Sub-Phase 2.12 — Final: OpenAPI Spec & Seed Update

**Goal**: Ensure documentation and seed data match the full implementation.

### Tasks:
1. Update `openapi.yaml` with all new endpoints from phases 2.1–2.10.
2. Update `lib/db/seed.ts` to also seed:
   - Default programmes (3–4 programmes).
   - Current academic year.
   - Default categories for announcements, events, and L&F.
   - Default event categories (Sports, Academic, Religious, Career, Cultural, Social).
3. Update `.env.example` with all new environment variables.
4. Update `README.md` with new setup steps.

### Git Commits:
```
docs: update openapi.yaml with all Phase 2 endpoints
feat: update seed with programmes, academic year, and all categories
docs: update README with Phase 2 setup instructions
```

---

## Git Strategy Summary

- **Branch name**: `feature/phase-2-content-modules`
- Commit after **each working feature**, not at the end of a sub-phase.
- Commit message format: `type(scope): description`
  - `feat:` — new feature
  - `fix:` — bug fix
  - `docs:` — documentation
  - `chore:` — config, deps, env
  - `refactor:` — code restructure without behavior change
- When sub-phase is complete and tested → merge into `main` via PR.
- Notify Flutter developer after each `main` merge so he can `git pull` and test.
