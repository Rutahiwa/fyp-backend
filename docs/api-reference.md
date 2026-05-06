# API Reference — UDSM Information Dissemination Platform
## Complete Endpoint Catalog (Phase 1 + Phase 2)

Base URL: `http://localhost:3000/api`
Auth: `Authorization: Bearer <jwt_token>` (unless marked Public)

---

## Auth (`/api/auth`)

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Public | Register new student (incl. programme/year) |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/generate-otp` | Public | Request password reset OTP |
| POST | `/auth/verify-otp` | Public | Verify OTP, get reset token |
| POST | `/auth/reset-password` | Public | Reset password with token |
| POST | `/auth/change-password` | JWT | Change password (logged in) |
| POST | `/auth/change-email-request`| JWT | Request email change (sends OTP to NEW email) |
| POST | `/auth/change-email-verify` | JWT | Verify OTP and update email |

**`POST /auth/register` body:**
```json
{
  "fullName": "John Doe",
  "registrationNumber": "BCS-01-0001-2024",
  "email": "john@example.com",
  "password": "password123",
  "sex": "MALE",
  "programmeId": "uuid",
  "yearOfStudy": 1
}
```

**`POST /auth/change-email-request` body:**
```json
{ "newEmail": "new-email@example.com" }
```

**`POST /auth/change-email-verify` body:**
```json
{ "newEmail": "new-email@example.com", "otpCode": "123456" }
```

---

## Users (`/api/users`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/users` | `user.read` | List users (paginated, searchable) |
| GET | `/users/{id}` | JWT | Get user profile |
| PUT | `/users/{id}` | JWT (owner or admin) | Update profile |
| DELETE | `/users/{id}` | JWT (owner or admin) | Soft delete user |

**`PUT /users/{id}` body (student completing profile):**
```json
{
  "programmeId": "uuid",
  "yearOfStudy": 2,
  "currentSemester": 1,
  "fullName": "Updated Name"
}
```

---

## Roles & Permissions (Phase 1 — unchanged)

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/roles` | List all roles |
| POST | `/roles` | Create role (admin) |
| GET | `/roles/{id}` | Get role with permissions |
| PUT | `/roles/{id}` | Update role |
| DELETE | `/roles/{id}` | Delete role |
| GET | `/permissions` | List all permissions |
| GET | `/permissions/{id}` | Get single permission |
| GET | `/audit-logs` | List audit logs (admin) |

---

## Colleges (`/api/colleges`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/colleges` | JWT | List all colleges |
| POST | `/colleges` | admin | Create college |

---

## Programmes (`/api/programmes`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/programmes` | JWT | List all programmes |
| GET | `/programmes?collegeId={id}` | JWT | List programmes by college |
| POST | `/programmes` | `programme.manage` | Create programme |
| GET | `/programmes/{id}` | JWT | Get one programme |
| PUT | `/programmes/{id}` | `programme.manage` | Update |
| DELETE | `/programmes/{id}` | `programme.manage` | Soft delete |

**`POST /programmes` body:**
```json
{ "name": "BSc Computer Science", "code": "BSC_CS", "durationYears": 3 }
```

---

## Academic Years (`/api/academic-years`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/academic-years` | JWT | List all academic years |
| GET | `/academic-years/current` | JWT | Get current academic year |
| POST | `/academic-years` | `academic_year.manage` | Create year |
| PUT | `/academic-years/{id}` | `academic_year.manage` | Update |
| POST | `/academic-years/{id}/set-current` | `academic_year.manage` | Set as current (flips others) |

**`POST /academic-years` body:**
```json
{ "label": "2024/2025", "startDate": "2024-09-01", "endDate": "2025-08-31" }
```

---

## Lecturer Assignments (`/api/lecturer-assignments`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/lecturer-assignments` | `assignment.manage` | List all assignments |
| POST | `/lecturer-assignments` | `assignment.manage` | Assign lecturer to class |
| DELETE | `/lecturer-assignments/{id}` | `assignment.manage` | Remove assignment |

**`POST /lecturer-assignments` body:**
```json
{
  "lecturerId": "uuid",
  "programmeId": "uuid",
  "yearOfStudy": 2,
  "semester": 1,
  "subjectName": "Database Systems",
  "academicYearId": "uuid"
}
```

---

## CR Assignments (`/api/cr-assignments`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/cr-assignments` | `assignment.manage` | List all CR assignments |
| POST | `/cr-assignments` | `assignment.manage` | Assign CR (max 2 per class) |
| DELETE | `/cr-assignments/{id}` | `assignment.manage` | Remove CR assignment |

---

## Media (`/api/media`)

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/media/upload` | JWT | Upload file → returns mediaId and URL |

**Request:** `multipart/form-data` with field `file`.
**Response:**
```json
{
  "success": true,
  "data": { "id": "uuid", "url": "https://...", "type": "IMAGE", "sizeBytes": 204800 }
}
```

---

## Categories (`/api/categories`)

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/categories` | JWT | List categories. Filter: `?module=ANNOUNCEMENT` |
| POST | `/categories` | admin | Create category |
| GET | `/event-categories` | JWT | List event categories |
| POST | `/event-categories` | admin | Create event category |

---

## Announcements (`/api/announcements`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/announcements` | JWT | Personalized feed (auto-filtered) |
| GET | `/announcements?isForYou=true` | JWT | Strictly personalized class feed |
| GET | `/announcements/{id}` | JWT | Single announcement (increments viewCount) |
| POST | `/announcements` | `announcement.create` | Create announcement |
| PUT | `/announcements/{id}` | `announcement.update` | Update |
| DELETE | `/announcements/{id}` | `announcement.delete` | Soft delete |
| POST | `/announcements/{id}/pin` | `announcement.pin` | Toggle isPinned |
| POST | `/announcements/{id}/reactions` | JWT | Toggle like (idempotent) |
| GET | `/announcements/{id}/comments` | JWT | List comments |
| POST | `/announcements/{id}/comments` | JWT | Post comment |
| DELETE | `/announcements/{id}/comments/{commentId}` | JWT | Delete comment (owner/admin) |

**`POST /announcements` body:**
```json
{
  "title": "Examination Timetable — Semester 1",
  "content": "## Exam Timetable\n\nPlease find the timetable below...",
  "excerpt": "Semester 1 exam timetable is now available.",
  "type": "ANNOUNCEMENT",
  "status": "PUBLISHED",
  "categoryId": "uuid",
  "coverImageId": "uuid",
  "academicYearId": "uuid",
  "audiences": [
    { "targetType": "PROGRAMME_YEAR", "programmeId": "uuid", "yearOfStudy": 2 },
    { "targetType": "PROGRAMME_YEAR", "programmeId": "uuid", "yearOfStudy": 3 }
  ],
  "mediaIds": ["uuid1", "uuid2"]
}
```

**GET `/announcements` query params:**
- `page`, `pageSize` — pagination
- `type` — `ANNOUNCEMENT` | `NOTICE` | `NEWS`
- `categoryId` — filter by category
- `search` — search in title

**Feed filtering logic (backend):**
- Pinned posts always come first.
- Admin/staff see ALL announcements.
- Lecturers see announcements targeted to `"ALL"`, `"ROLE"` (lecturer), and their assigned programme+year.
- Students/CRs see announcements targeted to `"ALL"` or their matching `programmeId + yearOfStudy`.

---

## Stories (`/api/stories`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/stories` | JWT | Active stories only (expiresAt > now) |
| POST | `/stories` | `story.create` | Create story (admin/staff) |
| POST | `/stories/{id}/view` | JWT | Mark story as viewed |
| DELETE | `/stories/{id}` | `story.delete` | Early removal (admin) |

**`POST /stories` body:**
```json
{
  "mediaId": "uuid",
  "caption": "Library closes at 6PM today!",
  "linkUrl": "https://...",
  "linkText": "Read more"
}
```
Backend auto-sets: `expiresAt = createdAt + 24 hours`.

**GET `/stories` response includes:**
```json
{
  "data": [{
    "id": "uuid",
    "mediaUrl": "https://...",
    "caption": "...",
    "expiresAt": "2024-11-16T10:00:00Z",
    "hasViewed": false,
    "viewCount": 42,
    "author": { "id": "uuid", "fullName": "Student Affairs" }
  }]
}
```

---

## Events (`/api/events`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/events` | JWT | All published events |
| GET | `/events/{id}` | JWT | Single event + RSVP counts |
| POST | `/events` | `event.create` | Create event |
| PUT | `/events/{id}` | `event.update` | Update |
| DELETE | `/events/{id}` | `event.delete` | Soft delete |
| POST | `/events/{id}/rsvp` | JWT | Create/update RSVP |
| DELETE | `/events/{id}/rsvp` | JWT | Remove RSVP |
| GET | `/events/{id}/attendees` | admin | List attendees |

**`POST /events` body:**
```json
{
  "title": "UDSM Sports Day 2024",
  "description": "## Annual Sports Day\n\nJoin us for...",
  "categoryId": "uuid-sports-category",
  "status": "PUBLISHED",
  "location": "UDSM Main Grounds",
  "locationUrl": "https://maps.google.com/...",
  "startDateTime": "2024-12-01T08:00:00Z",
  "endDateTime": "2024-12-01T18:00:00Z",
  "maxAttendees": 500,
  "coverImageId": "uuid",
  "academicYearId": "uuid"
}
```

**`POST /events/{id}/rsvp` body:**
```json
{ "status": "GOING" }
```
Returns `400` if event is at capacity.

**GET `/events` query params:**
- `categoryId`, `upcoming` (`true`/`false`), `page`, `pageSize`

---

## Lost & Found (`/api/lost-found`)

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/lost-found` | JWT | List items |
| GET | `/lost-found/{id}` | JWT | Single item |
| POST | `/lost-found` | JWT | Report item |
| PUT | `/lost-found/{id}` | JWT (owner/admin) | Update |
| POST | `/lost-found/{id}/resolve` | JWT (owner/admin) | Mark resolved |
| DELETE | `/lost-found/{id}` | JWT (owner/admin) | Soft delete |
| GET | `/lost-found/{id}/comments` | JWT | List comments |
| POST | `/lost-found/{id}/comments` | JWT | Post comment |

**`POST /lost-found` body:**
```json
{
  "type": "LOST",
  "title": "Lost: Black Samsung Galaxy A54",
  "description": "Lost near the main library on Monday afternoon...",
  "categoryId": "uuid",
  "locationSeen": "Near UDSM Main Library",
  "dateLostOrFound": "2024-11-14",
  "isAnonymous": false,
  "contactInfo": "+255 712 345 678",
  "mediaIds": ["uuid"]
}
```

**GET `/lost-found` query params:** `type`, `status`, `categoryId`, `page`, `pageSize`.

> **Anonymity Rule**: If `isAnonymous=true`, the `reporter` field is stripped from responses for non-admin users.

---

## Feedback (`/api/feedback`)

| Method | Path | Permission | Description |
| :--- | :--- | :--- | :--- |
| GET | `/feedback` | JWT | List current user's feedback history |
| POST | `/feedback` | JWT | Submit new feedback |
| GET | `/admin/feedback` | admin | List all feedback (for review) |
| PUT | `/admin/feedback/{id}` | admin | Update status/notes |

**`POST /feedback` body:**
```json
{
  "categoryId": "uuid",
  "subject": "Delayed exam results",
  "description": "The results for CS201 have not been posted..."
}
```

---

## Notifications (`/api/notifications`)

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/notifications/token` | JWT | Register FCM device token |
| GET | `/notifications` | JWT | User notification inbox |
| PUT | `/notifications/{id}/read` | JWT | Mark one as read |
| PUT | `/notifications/read-all` | JWT | Mark all as read |
| GET | `/notifications/preferences` | JWT | Get preferences |
| PUT | `/notifications/preferences` | JWT | Update preferences |

**`POST /notifications/token` body:**
```json
{ "fcmToken": "fcm-device-token-here", "deviceType": "ANDROID" }
```

**`PUT /notifications/preferences` body:**
```json
{
  "announcements": true,
  "events": true,
  "stories": true,
  "lostFound": false,
  "eventCategoryPreferences": ["uuid-sports", "uuid-career"]
}
```

---

## Standard Response Formats

**Success:**
```json
{ "success": true, "message": "Success", "data": { } }
```

**Paginated:**
```json
{
  "success": true, "message": "Success",
  "data": [],
  "meta": { "total": 100, "page": 1, "pageSize": 20, "totalPages": 5 }
}
```

**Error:**
```json
{ "success": false, "message": "Validation failed", "errors": { } }
```

| HTTP Code | Meaning |
| :--- | :--- |
| 200 | OK |
| 201 | Created |
| 400 | Bad request / Validation error |
| 401 | Unauthorized (missing/expired token) |
| 403 | Forbidden (missing permission) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Internal server error |
