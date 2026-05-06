# Database Schemas — UDSM Information Dissemination Platform
## All Table Definitions (Drizzle ORM / PostgreSQL)

> Use this as the reference when writing schema files in `lib/db/schema/`.
> Follow the existing pattern: uuid PK, timestamps, soft-delete where shown.

---

## Phase 1 Tables (Already Implemented)
- `users` — `lib/db/schema/users.ts`
- `roles` — `lib/db/schema/roles.ts`
- `permissions` — `lib/db/schema/permissions.ts`
- `permission_groups` — `lib/db/schema/permission-groups.ts`
- `role_permissions` — `lib/db/schema/role-permissions.ts`
- `otp` — `lib/db/schema/otp.ts`
- `audit_logs` — `lib/db/schema/audit-logs.ts`

---

## Phase 2 New Tables

### `colleges` → `lib/db/schema/colleges.ts`
```typescript
export const colleges = pgTable("colleges", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      varchar("name", { length: 255 }).notNull(), // "College of ICT"
  shortName: varchar("short_name", { length: 50 }).notNull().unique(), // "CoICT"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

### `programmes` → `lib/db/schema/programmes.ts`
```typescript
export const programmes = pgTable("programmes", {
  id:            uuid("id").primaryKey().defaultRandom(),
  collegeId:     uuid("college_id").notNull().references(() => colleges.id),
  name:          varchar("name", { length: 255 }).notNull(),        // "BSc Computer Science"
  code:          varchar("code", { length: 20 }).notNull().unique(), // "BSC_CS"
  durationYears: integer("duration_years").notNull(),                // 3 | 4 | 5
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
  deletedAt:     timestamp("deleted_at"),
});
```

---

### `academic_years` → `lib/db/schema/academic-years.ts`
```typescript
export const academicYears = pgTable("academic_years", {
  id:        uuid("id").primaryKey().defaultRandom(),
  label:     varchar("label", { length: 20 }).notNull().unique(), // "2024/2025"
  startDate: date("start_date").notNull(),
  endDate:   date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// App logic: when setting isCurrent=true on one row, set all others to false.
```

---

### Users Table — Additional Fields (migration to existing schema)

> [!IMPORTANT]
> The existing `course` varchar field is **REMOVED** in Sub-Phase 2.2 and replaced by the FK fields below. Update the Zod `registerSchema` to remove `course` and add `programmeId` + `yearOfStudy`.

```typescript
// REMOVE from existing users table:
// course: varchar("course", { length: 150 }).notNull(),

// ADD to existing users table in lib/db/schema/users.ts:
collegeId:       uuid("college_id").references(() => colleges.id),
programmeId:     uuid("programme_id").references(() => programmes.id),
yearOfStudy:     integer("year_of_study"),   // 1 | 2 | 3 | 4 | 5
currentSemester: integer("current_semester"), // 1 | 2
```

> Default `roleId` on registration: always auto-assign the `student` role. The register route must look up the student role ID from the DB and set it — do NOT accept `roleId` from the request body.

---

### `lecturer_class_assignments` → `lib/db/schema/lecturer-assignments.ts`
```typescript
export const lecturerAssignments = pgTable("lecturer_class_assignments", {
  id:             uuid("id").primaryKey().defaultRandom(),
  lecturerId:     uuid("lecturer_id").notNull().references(() => users.id),
  programmeId:    uuid("programme_id").notNull().references(() => programmes.id),
  yearOfStudy:    integer("year_of_study").notNull(),
  semester:       integer("semester").notNull(),         // 1 | 2
  subjectName:    varchar("subject_name", { length: 255 }).notNull(),
  academicYearId: uuid("academic_year_id").notNull().references(() => academicYears.id),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniq: unique().on(t.lecturerId, t.programmeId, t.yearOfStudy, t.semester, t.academicYearId, t.subjectName),
}));
```

---

### `cr_assignments` → `lib/db/schema/cr-assignments.ts`
```typescript
export const crAssignments = pgTable("cr_assignments", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         uuid("user_id").notNull().references(() => users.id),
  programmeId:    uuid("programme_id").notNull().references(() => programmes.id),
  yearOfStudy:    integer("year_of_study").notNull(),
  academicYearId: uuid("academic_year_id").notNull().references(() => academicYears.id),
  assignedBy:     uuid("assigned_by").notNull().references(() => users.id),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});
// App logic: max 2 rows per (programmeId, yearOfStudy, academicYearId) enforced in route handler.
```

---

### `media` → `lib/db/schema/media.ts`
```typescript
export const media = pgTable("media", {
  id:         uuid("id").primaryKey().defaultRandom(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  url:        varchar("url", { length: 500 }).notNull(),
  type:       varchar("type", { length: 10 }).notNull(),   // "IMAGE" | "VIDEO" | "FILE"
  mimeType:   varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes:  integer("size_bytes").notNull(),
  filename:   varchar("filename", { length: 255 }).notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});
```

---

### `categories` → `lib/db/schema/categories.ts`
```typescript
export const categories = pgTable("categories", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      varchar("name", { length: 100 }).notNull(),
  slug:      varchar("slug", { length: 100 }).notNull().unique(),
  module:    varchar("module", { length: 20 }).notNull(), // "ANNOUNCEMENT" | "LOST_FOUND" | "FEEDBACK"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

Default seed data for Feedback categories (module = "FEEDBACK"):
- "Academic Issues", "Facilities", "Administration", "Student Welfare", "Other"

---

### `event_categories` → `lib/db/schema/event-categories.ts`
```typescript
export const eventCategories = pgTable("event_categories", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      varchar("name", { length: 100 }).notNull(),
  slug:      varchar("slug", { length: 100 }).notNull().unique(),
  iconName:  varchar("icon_name", { length: 50 }),  // Flutter icon identifier
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### `announcements` → `lib/db/schema/announcements.ts`
```typescript
export const announcements = pgTable("announcements", {
  id:             uuid("id").primaryKey().defaultRandom(),
  title:          varchar("title", { length: 255 }).notNull(),
  slug:           varchar("slug", { length: 255 }).notNull().unique(),
  content:        text("content").notNull(),           // Markdown
  excerpt:        varchar("excerpt", { length: 500 }),
  type:           varchar("type", { length: 20 }).notNull(),   // "ANNOUNCEMENT"|"NOTICE"|"NEWS"
  status:         varchar("status", { length: 20 }).notNull().default("DRAFT"),
  authorId:       uuid("author_id").notNull().references(() => users.id),
  categoryId:     uuid("category_id").references(() => categories.id),
  coverImageId:   uuid("cover_image_id").references(() => media.id),
  isPinned:       boolean("is_pinned").default(false).notNull(),
  viewCount:      integer("view_count").default(0).notNull(),
  publishedAt:    timestamp("published_at"),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  deletedAt:      timestamp("deleted_at"),
});
```

---

### `announcement_audiences` → `lib/db/schema/announcement-audiences.ts`
```typescript
export const announcementAudiences = pgTable("announcement_audiences", {
  id:             uuid("id").primaryKey().defaultRandom(),
  announcementId: uuid("announcement_id").notNull().references(() => announcements.id),
  targetType:     varchar("target_type", { length: 20 }).notNull(),
                  // "ALL" | "COLLEGE" | "PROGRAMME" | "PROGRAMME_YEAR" | "ROLE"
  collegeId:      uuid("college_id").references(() => colleges.id),   // for COLLEGE targetType
  programmeId:    uuid("programme_id").references(() => programmes.id), // for PROGRAMME / PROGRAMME_YEAR
  yearOfStudy:    integer("year_of_study"),
  semester:       integer("semester"),
  roleTarget:     varchar("role_target", { length: 50 }), // e.g. "lecturer" for ROLE targetType
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});
```

**Feed filtering logic for `GET /announcements`:**
| Audience row `targetType` | Shown to |
| :--- | :--- |
| `ALL` | Every authenticated user |
| `COLLEGE` | Users whose `collegeId` matches |
| `PROGRAMME` | Users whose `programmeId` matches |
| `PROGRAMME_YEAR` | Users whose `programmeId` + `yearOfStudy` matches |
| `ROLE` | Users whose role name matches `roleTarget` |

Admin and staff always see ALL announcements regardless of audience.

`GET /announcements?isForYou=true` → returns ONLY `PROGRAMME_YEAR` rows matching the user's class — no `ALL` or `COLLEGE` posts.

---

### `announcement_media` → `lib/db/schema/announcement-media.ts`
```typescript
export const announcementMedia = pgTable("announcement_media", {
  announcementId: uuid("announcement_id").notNull().references(() => announcements.id),
  mediaId:        uuid("media_id").notNull().references(() => media.id),
}, (t) => ({ pk: primaryKey({ columns: [t.announcementId, t.mediaId] }) }));
```

---

### `stories` → `lib/db/schema/stories.ts`
```typescript
export const stories = pgTable("stories", {
  id:              uuid("id").primaryKey().defaultRandom(),
  authorId:        uuid("author_id").notNull().references(() => users.id),
  collegeId:       uuid("college_id").references(() => colleges.id), // which college the story is from
  mediaId:         uuid("media_id").references(() => media.id),
  caption:         varchar("caption", { length: 500 }),
  backgroundColor: varchar("background_color", { length: 7 }), // hex "#FF5733"
  linkUrl:         varchar("link_url", { length: 500 }),
  linkText:        varchar("link_text", { length: 100 }),
  viewCount:       integer("view_count").default(0).notNull(),
  expiresAt:       timestamp("expires_at").notNull(), // set to createdAt + 24h by backend
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  deletedAt:       timestamp("deleted_at"),
});
```

> `collegeId` is what maps to the "College Name" field in the Flutter "New Story" form. The Flutter app sends `collegeId`; the backend resolves the college name for display.

---

### `story_views` → `lib/db/schema/story-views.ts`
```typescript
export const storyViews = pgTable("story_views", {
  storyId:  uuid("story_id").notNull().references(() => stories.id),
  userId:   uuid("user_id").notNull().references(() => users.id),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.storyId, t.userId] }) }));
```

---

### `events` → `lib/db/schema/events.ts`
```typescript
export const events = pgTable("events", {
  id:             uuid("id").primaryKey().defaultRandom(),
  title:          varchar("title", { length: 255 }).notNull(),
  slug:           varchar("slug", { length: 255 }).notNull().unique(),
  description:    text("description").notNull(),        // Markdown
  categoryId:     uuid("category_id").notNull().references(() => eventCategories.id),
  status:         varchar("status", { length: 20 }).notNull().default("DRAFT"),
  organizerId:    uuid("organizer_id").notNull().references(() => users.id),
  coverImageId:   uuid("cover_image_id").references(() => media.id),
  location:       varchar("location", { length: 255 }),
  locationUrl:    varchar("location_url", { length: 500 }),
  startDateTime:  timestamp("start_date_time").notNull(),
  endDateTime:    timestamp("end_date_time").notNull(),
  maxAttendees:   integer("max_attendees"),              // null = unlimited
  isPinned:       boolean("is_pinned").default(false).notNull(),
  viewCount:      integer("view_count").default(0).notNull(),
  publishedAt:    timestamp("published_at"),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
  deletedAt:      timestamp("deleted_at"),
});
```

---

### `event_rsvps` → `lib/db/schema/event-rsvps.ts`
```typescript
export const eventRsvps = pgTable("event_rsvps", {
  id:        uuid("id").primaryKey().defaultRandom(),
  eventId:   uuid("event_id").notNull().references(() => events.id),
  userId:    uuid("user_id").notNull().references(() => users.id),
  status:    varchar("status", { length: 20 }).notNull(), // "GOING"|"INTERESTED"|"NOT_GOING"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({ uniq: unique().on(t.eventId, t.userId) }));
```

---

### `lost_found_items` → `lib/db/schema/lost-found.ts`
```typescript
export const lostFoundItems = pgTable("lost_found_items", {
  id:              uuid("id").primaryKey().defaultRandom(),
  reporterId:      uuid("reporter_id").notNull().references(() => users.id),
  type:            varchar("type", { length: 10 }).notNull(),   // "LOST" | "FOUND"
  title:           varchar("title", { length: 255 }).notNull(),
  description:     text("description").notNull(),
  categoryId:      uuid("category_id").references(() => categories.id),
  locationSeen:    varchar("location_seen", { length: 255 }),
  status:          varchar("status", { length: 20 }).notNull().default("OPEN"),
  dateLostOrFound: date("date_lost_or_found").notNull(),
  isAnonymous:     boolean("is_anonymous").default(false).notNull(),
  contactInfo:     varchar("contact_info", { length: 255 }),
  viewCount:       integer("view_count").default(0).notNull(),
  resolvedAt:      timestamp("resolved_at"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
  deletedAt:       timestamp("deleted_at"),
});
```

---

### `lost_found_media` → `lib/db/schema/lost-found-media.ts`
```typescript
export const lostFoundMedia = pgTable("lost_found_media", {
  itemId:  uuid("item_id").notNull().references(() => lostFoundItems.id),
  mediaId: uuid("media_id").notNull().references(() => media.id),
}, (t) => ({ pk: primaryKey({ columns: [t.itemId, t.mediaId] }) }));
```

---

### `comments` → `lib/db/schema/comments.ts`
```typescript
export const comments = pgTable("comments", {
  id:         uuid("id").primaryKey().defaultRandom(),
  authorId:   uuid("author_id").notNull().references(() => users.id),
  targetId:   uuid("target_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(),
              // "ANNOUNCEMENT" | "EVENT" | "LOST_FOUND"
  content:    text("content").notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull(),
  deletedAt:  timestamp("deleted_at"),
});
```

---

### `reactions` → `lib/db/schema/reactions.ts`
```typescript
export const reactions = pgTable("reactions", {
  id:         uuid("id").primaryKey().defaultRandom(),
  userId:     uuid("user_id").notNull().references(() => users.id),
  targetId:   uuid("target_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(),
  type:       varchar("type", { length: 20 }).notNull().default("LIKE"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ uniq: unique().on(t.userId, t.targetId, t.targetType) }));
```

---

### `notification_tokens` → `lib/db/schema/notification-tokens.ts`
```typescript
export const notificationTokens = pgTable("notification_tokens", {
  id:         uuid("id").primaryKey().defaultRandom(),
  userId:     uuid("user_id").notNull().references(() => users.id),
  fcmToken:   text("fcm_token").notNull().unique(),
  deviceType: varchar("device_type", { length: 10 }).notNull(), // "ANDROID" | "IOS"
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull(),
});
```

---

### `notifications` → `lib/db/schema/notifications.ts`
```typescript
export const notifications = pgTable("notifications", {
  id:         uuid("id").primaryKey().defaultRandom(),
  userId:     uuid("user_id").notNull().references(() => users.id),
  title:      varchar("title", { length: 255 }).notNull(),
  body:       text("body").notNull(),
  type:       varchar("type", { length: 20 }).notNull(),
              // "ANNOUNCEMENT"|"EVENT"|"STORY"|"LOST_FOUND"|"SYSTEM"
  targetId:   uuid("target_id"),
  targetType: varchar("target_type", { length: 20 }),
  isRead:     boolean("is_read").default(false).notNull(),
  sentAt:     timestamp("sent_at").defaultNow().notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});
```

---

### `user_notification_preferences` → `lib/db/schema/notification-preferences.ts`
```typescript
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id:                       uuid("id").primaryKey().defaultRandom(),
  userId:                   uuid("user_id").notNull().unique().references(() => users.id),
  announcements:            boolean("announcements").default(true).notNull(),
  events:                   boolean("events").default(true).notNull(),
  stories:                  boolean("stories").default(true).notNull(),
  lostFound:                boolean("lost_found").default(false).notNull(),
  eventCategoryPreferences: jsonb("event_category_preferences"), // uuid[]
  createdAt:                timestamp("created_at").defaultNow().notNull(),
  updatedAt:                timestamp("updated_at").defaultNow().notNull(),
});
```

---

### `feedback` → `lib/db/schema/feedback.ts`
```typescript
export const feedback = pgTable("feedback", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      uuid("user_id").notNull().references(() => users.id),
  categoryId:  uuid("category_id").notNull().references(() => categories.id),
  subject:     varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status:      varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING | REVIEWED | RESOLVED
  adminNotes:  text("admin_notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});
```

---

## Schema Index Update
All new schemas must be exported from `lib/db/schema/index.ts`:
```typescript
// Add these exports in Phase 2:
export * from "./colleges";
export * from "./programmes";
export * from "./academic-years";
export * from "./lecturer-assignments";
export * from "./cr-assignments";
export * from "./media";
export * from "./categories";
export * from "./event-categories";
export * from "./announcements";
export * from "./announcement-audiences";
export * from "./announcement-media";
export * from "./stories";
export * from "./story-views";
export * from "./events";
export * from "./event-rsvps";
export * from "./lost-found";
export * from "./lost-found-media";
export * from "./comments";
export * from "./reactions";
export * from "./notification-tokens";
export * from "./notifications";
export * from "./notification-preferences";
export * from "./feedback";
```
