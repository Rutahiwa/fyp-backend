# Flutter Integration Guide
## UDSM Information Dissemination Platform

This guide is written for the Flutter frontend developer. It explains step by step how to connect the Flutter app to the backend API.

---

## 1. Environment Setup

### Backend Base URL
When running the backend locally (`npm run dev`):

| Flutter Environment | Base URL to use |
| :--- | :--- |
| Android Emulator | `http://10.0.2.2:3000/api` |
| Physical Android/iOS device | `http://YOUR_PC_IP:3000/api` (e.g. `http://192.168.1.5:3000/api`) |
| Production (future) | `https://api.udsminfo.com/api` |

> [!IMPORTANT]
> **Never use `localhost` in Flutter** when testing on a physical device or emulator. Use the IP address of the machine running the backend. Both devices must be on the same Wi-Fi network.

### Recommended Flutter Packages
Add these to your `pubspec.yaml`:
```yaml
dependencies:
  http: ^1.2.0                    # HTTP client for API calls
  flutter_secure_storage: ^9.0.0  # Secure JWT token storage
  firebase_core: ^2.27.0          # Firebase initialization
  firebase_messaging: ^14.7.0     # FCM push notifications
  flutter_markdown: ^0.6.18       # Render markdown content (announcements)
  cached_network_image: ^3.3.0    # Efficient image loading
  intl: ^0.19.0                   # Date formatting
```

---

## 2. Authentication Flow

### 2.1 Registration (New Student)
**Endpoint:** `POST /auth/register`

**What Flutter does:** Show a registration form with the following fields.

**Request Body:**
```json
{
  "fullName": "John Mwangi",
  "registrationNumber": "2021-04-00234",
  "email": "john@example.com",
  "password": "securepassword",
  "sex": "MALE",
  "collegeId": "uuid-here",
  "programmeId": "uuid-here",
  "yearOfStudy": 2
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": "uuid-here", "email": "john@example.com" }
}
```

**After registration:** Navigate to the login screen. Do NOT auto-login — the user should log in manually.

---

### 2.2 Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "fullName": "Super Admin",
      "email": "admin@udsminfo.com",
      "roleId": "uuid",
      "registrationNumber": "ADMIN001"
    }
  }
}
```

**What Flutter does after login:**
1. Extract `data.token` from the response.
2. Store it securely using `flutter_secure_storage`:
   ```dart
   final storage = FlutterSecureStorage();
   await storage.write(key: 'jwt_token', value: token);
   await storage.write(key: 'user_data', value: jsonEncode(user));
   ```
3. Navigate to the home screen.
4. Register the FCM device token (see Section 6).

---

### 2.3 Using the JWT Token on Every Request

Every protected API call **must** include the JWT token in the `Authorization` header:

```dart
final token = await storage.read(key: 'jwt_token');

final response = await http.get(
  Uri.parse('$baseUrl/announcements'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```

**Create a reusable API client class** in your Flutter project that automatically attaches this header to every request. Do not copy-paste headers manually in every screen.

---

### 2.4 Token Expiry
- Tokens expire after **7 days** (configured in backend).
- If any API returns **HTTP 401**, the token has expired or is invalid.
- When 401 is received: clear the stored token, clear user data, and navigate to the login screen.

```dart
if (response.statusCode == 401) {
  await storage.deleteAll();
  Navigator.pushReplacementNamed(context, '/login');
}
```

---

### 2.5 Password Reset Flow
Three-step process: Request OTP → Verify OTP → Reset Password.

**Step 1 — Request OTP:**
`POST /auth/generate-otp` → body: `{ "email": "user@example.com" }`
→ User receives a 6-digit code via email.

**Step 2 — Verify OTP:**
`POST /auth/verify-otp` → body: `{ "email": "...", "otpCode": "123456" }`
→ Returns `{ "data": { "resetToken": "short-lived-token" } }`
→ Store `resetToken` temporarily in memory (NOT secure storage — it's short-lived).

**Step 3 — Reset Password:**
`POST /auth/reset-password` → body: `{ "resetToken": "...", "newPassword": "newpass123" }`
→ On success, navigate to login.

---

### 2.6 Change Email (Verified Flow)
This requires two steps to ensure the new email is valid.

**Step 1 — Request Change:**
`POST /auth/change-email-request` (JWT required)
→ Body: `{ "newEmail": "new-email@example.com" }`
→ User receives a 6-digit code on the **NEW** email.

**Step 2 — Verify and Update:**
`POST /auth/change-email-verify` (JWT required)
→ Body: `{ "newEmail": "new-email@example.com", "otpCode": "123456" }`
→ On success, the email is updated.

---

### 2.7 Change Password (While Logged In)
`POST /auth/change-password` (JWT required)

```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

---

## 3. User Profile

### 3.1 Get Current User
`GET /users/{id}` — use the `id` from the stored user object.

**Response includes:** `fullName`, `email`, `registrationNumber`, `collegeId`, `programmeId`, `yearOfStudy`, `currentSemester`, `isActive`.

### 3.2 Update Profile
`PUT /users/{id}` (JWT required)

### 3.3 Get Colleges & Programmes
Flutter needs these to populate dropdowns in registration and profile screens.

1. **Get Colleges:** `GET /colleges`
2. **Get Programmes by College:** `GET /programmes?collegeId={id}`

```json
{
  "data": [
    { "id": "uuid", "name": "BSc Computer Science", "code": "BSC_CS", "durationYears": 3 },
    { "id": "uuid", "name": "BEng Electrical Engineering", "code": "BENG_EE", "durationYears": 4 }
  ]
}
```

---

## 4. Announcements Feed

### 4.1 Get Announcements (Personalized Feed)
`GET /announcements` (JWT required)

The backend automatically filters announcements based on the logged-in user's `programmeId`, `yearOfStudy`, and `role`. Flutter just needs to call this endpoint — no audience logic needed on the client.

**Query Parameters:**
| Param | Type | Description |
| :--- | :--- | :--- |
| `page` | integer | Page number (default: 1) |
| `pageSize` | integer | Items per page (default: 20) |
| `type` | string | Filter by type: `ANNOUNCEMENT`, `NOTICE`, `NEWS` |
| `categoryId` | uuid | Filter by category |
| `search` | string | Search in title/content |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Exam Timetable — Semester 1, 2024/2025",
      "slug": "exam-timetable-sem1-2024-2025",
      "excerpt": "The examination timetable for Semester 1...",
      "type": "ANNOUNCEMENT",
      "status": "PUBLISHED",
      "isPinned": true,
      "viewCount": 234,
      "publishedAt": "2024-11-15T08:00:00Z",
      "author": { "id": "uuid", "fullName": "Registrar Office" },
      "category": { "id": "uuid", "name": "Academic" },
      "coverImageUrl": "https://...",
      "reactionCount": 12,
      "commentCount": 5,
      "hasReacted": true
    }
  ],
  "meta": { "total": 50, "page": 1, "pageSize": 20, "totalPages": 3 }
}
```

**Flutter rendering notes:**
- Render `isPinned` announcements with a pin icon at the top.
- Render `excerpt` in list view; render full `content` (markdown) in detail view using `flutter_markdown`.
- `hasReacted` tells you whether the current user has already liked this post (for showing a filled/outline heart icon).

---

### 4.2 Get Single Announcement
`GET /announcements/{id}` (JWT required)

Returns the full announcement including `content` (full markdown body), all media attachments, reaction count, and comment count. Calling this endpoint also increments `viewCount`.

---

### 4.3 React to an Announcement (Like/Unlike)
`POST /announcements/{id}/reactions` (JWT required)

No request body needed. This endpoint **toggles** the reaction:
- If user has not liked → adds a like, returns `{ "action": "liked" }`.
- If user already liked → removes the like, returns `{ "action": "unliked" }`.

Update the UI optimistically (change the heart icon immediately, then confirm with response).

---

### 4.4 Comments on an Announcement
**List comments:** `GET /announcements/{id}/comments`

```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Thank you for the update!",
      "createdAt": "2024-11-15T09:00:00Z",
      "author": { "id": "uuid", "fullName": "John Mwangi" }
    }
  ]
}
```

**Post a comment:** `POST /announcements/{id}/comments`
```json
{ "content": "When will the hall allocation be posted?" }
```

**Delete a comment:** `DELETE /announcements/{id}/comments/{commentId}`
Only the comment author or an admin can delete.

---

## 5. Events

### 5.1 Get Events List
`GET /events` (JWT required)

All published events are visible to all authenticated users.

**Query Parameters:**
| Param | Description |
| :--- | :--- |
| `categoryId` | Filter by event category (Sports, Academic, etc.) |
| `upcoming` | `true` → only show events where startDateTime > now |
| `page`, `pageSize` | Pagination |

### 5.2 RSVP to an Event
`POST /events/{id}/rsvp` (JWT required)

```json
{ "status": "GOING" }
```
Valid values: `"GOING"`, `"INTERESTED"`, `"NOT_GOING"`.

If the event has a `maxAttendees` limit and it's full, the backend returns `400` with message "Event is at full capacity".

**Remove RSVP:** `DELETE /events/{id}/rsvp`

### 5.3 Event Categories (for filter tabs)
`GET /event-categories` → returns list of categories with `iconName` for Flutter icons.

---

## 6. Stories (Ephemeral — 24h)

### 6.1 Get Active Stories
`GET /stories` (JWT required)

Returns only stories where `expiresAt > now()`. The response includes a `hasViewed` field.

```json
{
  "data": [
    {
      "id": "uuid",
      "mediaUrl": "https://...",
      "caption": "Reminder: Library closes at 6PM today",
      "expiresAt": "2024-11-16T10:00:00Z",
      "hasViewed": false,
      "author": { "fullName": "Student Affairs" }
    }
  ]
}
```

**Flutter notes:**
- Show stories in a horizontal scrollable row at the top of the home screen (Instagram-style).
- Unviewed stories show a colored ring; viewed stories show a grey ring.
- Auto-advance to next story after a timer (e.g., 5 seconds per story).

### 6.2 Mark a Story as Viewed
`POST /stories/{id}/view` (JWT required) — no body needed.

Call this as soon as the story becomes visible on screen (not when the user taps it).

---

## 7. Lost & Found

### 7.1 Get Items
`GET /lost-found` (JWT required)

**Query Parameters:** `type` (LOST/FOUND), `status` (OPEN/RESOLVED), `categoryId`, `page`, `pageSize`.

> [!NOTE]
> If an item has `isAnonymous: true`, the `reporter` field will be `null` in the response. Do not attempt to show reporter info — just show "Anonymous".

### 7.2 Post a New Item
`POST /lost-found` (JWT required)

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
  "mediaIds": ["uuid-of-uploaded-image"]
}
```

`mediaIds` is an array of media IDs returned from the upload endpoint (see Section 9).

### 7.3 Resolve an Item
`POST /lost-found/{id}/resolve` (JWT, owner or admin only)

No body. Marks status as `RESOLVED` and sets `resolvedAt`. After resolving, update the UI to show the item as "RESOLVED".

---

## 8. Feedback Module

Allows students to send direct feedback/issues to university officials.

### 8.1 Submit Feedback
`POST /feedback` (JWT required)

```json
{
  "categoryId": "uuid",
  "subject": "Delayed exam results",
  "description": "The results for CS201 have not been posted yet..."
}
```

### 8.2 View History
`GET /feedback` (JWT required)

Returns the current user's submitted feedback and their statuses (`PENDING`, `REVIEWED`, `RESOLVED`) and any `adminNotes`.

---

## 9. Push Notifications (Firebase FCM)

### 9.1 Flutter-Side Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add an Android app (use your Flutter app's package name, e.g. `com.udsminfo.app`).
3. Download `google-services.json` → place it in `android/app/`.
4. Add Firebase to your Flutter app following the `firebase_core` and `firebase_messaging` setup guides.

### 8.2 Register the Device Token with the Backend
After the user logs in and Firebase is initialized, get the FCM token and send it to the backend:

```dart
final fcmToken = await FirebaseMessaging.instance.getToken();

// Send to backend
await http.post(
  Uri.parse('$baseUrl/notifications/token'),
  headers: { 'Authorization': 'Bearer $jwtToken', 'Content-Type': 'application/json' },
  body: jsonEncode({ 'fcmToken': fcmToken, 'deviceType': 'ANDROID' }),
);
```

**Also listen for token refresh** (tokens can change):
```dart
FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
  // Re-send to backend with the new token
});
```

### 8.3 Handle Incoming Notifications in Flutter
```dart
// Foreground notifications
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  // Show an in-app snackbar or dialog
  final type = message.data['type']; // "ANNOUNCEMENT", "EVENT", "STORY"
  final targetId = message.data['targetId'];
  // Navigate to the relevant screen
});

// Background / terminated state tap
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  // App was opened from notification tap
  // Navigate to relevant screen based on message.data['type']
});
```

### 8.4 Notification Preferences
`GET /notifications/preferences` → get current preferences.

`PUT /notifications/preferences`:
```json
{
  "announcements": true,
  "events": true,
  "stories": true,
  "lostFound": false,
  "eventCategoryPreferences": ["uuid-sports", "uuid-academic"]
}
```

Show a settings screen in the Flutter app where students can toggle these.

### 8.5 Notification Inbox
`GET /notifications` → paginated list of all past notifications for the user.

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "New Announcement",
      "body": "Exam timetable has been posted",
      "type": "ANNOUNCEMENT",
      "targetId": "uuid-of-announcement",
      "isRead": false,
      "sentAt": "2024-11-15T09:00:00Z"
    }
  ]
}
```

`PUT /notifications/{id}/read` → mark as read.
`PUT /notifications/read-all` → mark all as read.

Show an unread count badge on the notification bell icon.

---

## 9. Media Upload

All file uploads use a single endpoint before attaching to content.

**Endpoint:** `POST /media/upload` (JWT required)

**Request:** `multipart/form-data` with a `file` field.

```dart
final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/media/upload'));
request.headers['Authorization'] = 'Bearer $jwtToken';
request.files.add(await http.MultipartFile.fromPath('file', imagePath));

final response = await request.send();
final body = jsonDecode(await response.stream.bytesToString());
final mediaId = body['data']['id'];
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://your-project.supabase.co/storage/v1/object/...",
    "type": "IMAGE",
    "mimeType": "image/jpeg",
    "sizeBytes": 204800
  }
}
```

After uploading, store the `mediaId`. Include it in the `mediaIds` array when creating posts or lost & found items.

---

## 10. API Response Patterns

All API responses follow these consistent formats. Handle these globally in your API client.

### Success Response
```json
{ "success": true, "message": "Success", "data": { ... } }
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "total": 100, "page": 1, "pageSize": 20, "totalPages": 5 }
}
```

### Error Response
```json
{ "success": false, "message": "Validation failed", "errors": { ... } }
```

### Common HTTP Status Codes
| Code | Meaning | Flutter Action |
| :--- | :--- | :--- |
| 200 | Success | Use the data |
| 201 | Created | Show success message |
| 400 | Validation error | Show error from `message` field |
| 401 | Unauthorized | Clear token, go to login |
| 403 | Forbidden | Show "You don't have access" message |
| 404 | Not found | Show not found screen |
| 409 | Conflict (duplicate) | Show "already exists" message |
| 500 | Server error | Show generic error message |

---

## 11. Academic Year & Programmes

### Get Current Academic Year
`GET /academic-years/current` → returns the current year used to label content.

### Get All Programmes
`GET /programmes` → for registration and profile update dropdowns.

---

## 12. Development Testing Checklist

Before declaring a feature complete, test these scenarios in Flutter:

- [ ] Login with `admin@udsminfo.com` / `rut4shell` → receives JWT.
- [ ] Store token, attach to all subsequent requests.
- [ ] View announcements feed (personalized for the logged-in role).
- [ ] Open a single announcement and see full markdown content.
- [ ] Like and unlike an announcement.
- [ ] Post a comment and see it appear.
- [ ] View all events and RSVP as "Going".
- [ ] View stories in the horizontal scroll row.
- [ ] Post a Lost & Found item with an image.
- [ ] Register FCM token and receive a test push notification.
- [ ] Token expires → app redirects to login.
