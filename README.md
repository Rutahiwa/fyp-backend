# UDSM Information Dissemination Platform — Backend

Final Year Project — University of Dar es Salaam.  
Backend API built with **Next.js** (App Router), **Drizzle ORM**, and **PostgreSQL** (Supabase).

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (Supabase)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd fyp-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   API available at `http://localhost:3000/api`.

---

## API Modules

### Authentication & Users
| Endpoint | Auth | Description |
|:---|:---|:---|
| `POST /auth/register` | Public | Register new student |
| `POST /auth/login` | Public | Login, returns JWT |
| `POST /auth/change-password` | JWT | Change own password |
| `POST /auth/generate-otp` | Public | Request password reset OTP |
| `POST /auth/verify-otp` | Public | Verify OTP, get reset token |
| `POST /auth/reset-password` | Public | Reset password with token |
| `POST /auth/change-email-request` | JWT | Request email change (OTP to new email) |
| `POST /auth/change-email-verify` | JWT | Verify OTP and update email |
| `GET /users` | `user.read` | Paginated user list |
| `GET /users/{id}` | JWT | User profile |
| `PUT /users/{id}` | JWT | Update profile |
| `DELETE /users/{id}` | JWT | Soft delete user |

### Colleges & Programmes
| `GET /colleges` | JWT | List all colleges |
| `POST /colleges` | admin | Create college |
| `GET /programmes` | JWT | Paginated, filterable by `?collegeId=` |
| `POST /programmes` | `programme.manage` | Create programme |
| `GET/PUT/DELETE /programmes/{id}` | — | CRUD operations |

### Academic Years
| `GET /academic-years` | JWT | Paginated list |
| `GET /academic-years/current` | JWT | Current academic year |
| `POST /academic-years` | `academic_year.manage` | Create year |
| `PUT /academic-years/{id}` | `academic_year.manage` | Update year |
| `POST /academic-years/{id}/set-current` | `academic_year.manage` | Toggle isCurrent |

### Lecturer & CR Assignments
| `GET /lecturer-assignments` | `assignment.manage` | List with joins |
| `POST /lecturer-assignments` | `assignment.manage` | Assign lecturer |
| `DELETE /lecturer-assignments/{id}` | `assignment.manage` | Remove |
| `GET /cr-assignments` | `assignment.manage` | List with joins |
| `POST /cr-assignments` | `assignment.manage` | Assign CR (max 2/class) |
| `DELETE /cr-assignments/{id}` | `assignment.manage` | Remove |

### Media Upload
| `POST /media/upload` | JWT | Upload file (JPEG/PNG/WebP/GIF/MP4/PDF, max 10MB) |

### Categories
| `GET /categories` | JWT | List (filterable by `?module=`) |
| `POST /categories` | admin | Create category |
| `GET /event-categories` | JWT | List event categories with icons |
| `POST /event-categories` | admin | Create event category |

### Announcements
| `GET /announcements` | JWT | Personalized feed with audience targeting |
| `GET /announcements?isForYou=true` | JWT | Class-only feed |
| `POST /announcements` | `announcement.create` | Create with audiences |
| `GET /announcements/{id}` | JWT | Detail + increment viewCount |
| `PUT /announcements/{id}` | `announcement.update` | Update |
| `DELETE /announcements/{id}` | `announcement.delete` | Soft delete |
| `POST /announcements/{id}/pin` | `announcement.pin` | Toggle pin |

### Stories
| `GET /stories` | JWT | Active stories (24h, with hasViewed flag) |
| `POST /stories` | `story.create` | Create (auto-expires +24h) |
| `POST /stories/{id}/view` | JWT | Mark as viewed |
| `DELETE /stories/{id}` | `story.delete` | Soft delete |

### Events
| `GET /events` | JWT | Paginated, filterable by `?categoryId=&status=&upcoming=` |
| `POST /events` | `event.create` | Create event |
| `GET /events/{id}` | JWT | Detail with RSVP counts |
| `PUT /events/{id}` | `event.update` | Update |
| `DELETE /events/{id}` | `event.delete` | Soft delete |
| `POST /events/{id}/rsvp` | JWT | Upsert RSVP (capacity-checked) |
| `DELETE /events/{id}/rsvp` | JWT | Remove own RSVP |
| `GET /events/{id}/attendees` | `event.update` | List GOING users (admin) |

### Lost & Found
| `GET /lost-found` | JWT | Paginated, filterable (anonymous-safe) |
| `POST /lost-found` | JWT | Report item |
| `GET /lost-found/{id}` | JWT | Detail (reporter hidden if anonymous) |
| `PUT /lost-found/{id}` | JWT | Update (owner or admin) |
| `DELETE /lost-found/{id}` | JWT | Soft delete (owner or admin) |
| `POST /lost-found/{id}/resolve` | JWT | Mark as RESOLVED |

### Comments & Reactions
Comments and reactions are polymorphic — wired to announcements, events, and lost-found.
| `GET/POST /{module}/{id}/comments` | JWT | List or post comment |
| `DELETE /{module}/{id}/comments/{commentId}` | JWT | Delete comment (owner/admin) |
| `POST /{module}/{id}/reactions` | JWT | Toggle like (idempotent) |

### Feedback
| `GET /feedback` | JWT | User's own submissions |
| `POST /feedback` | JWT | Submit feedback |
| `GET /admin/feedback` | `feedback.manage` | All submissions (admin) |
| `PUT /admin/feedback/{id}` | `feedback.manage` | Update status + notes |

### RBAC & Audit
| `GET /roles` | `role.read` | List roles |
| `POST /roles` | `role.create` | Create role with permissions |
| `GET/PUT/DELETE /roles/{id}` | `role.*` | CRUD with built-in role protection |
| `GET /permissions` | `permission.read` | List all permissions |
| `GET /audit-logs` | `audit.read` | Paginated, multi-filter |

---

## Standard Response Format

```json
{ "success": true, "message": "Success", "data": {} }
{ "success": true, "data": [], "meta": { "total": 100, "page": 1, "pageSize": 20, "totalPages": 5 } }
{ "success": false, "message": "Error description", "errors": {} }
```

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Email**: Resend
- **Storage**: Supabase Storage
- **Validation**: Zod
- **Language**: TypeScript

## Full API Reference
See [openapi.yaml](./openapi.yaml) for the complete OpenAPI 3.0 specification.
