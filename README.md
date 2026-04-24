# UDSM Information Dissemination Platform - Backend

This is the backend API for the UDSM Information Dissemination Platform, built with Next.js, Drizzle ORM, and PostgreSQL.

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** database
- **npm** or **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fyp-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```
   Required variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Random string for token signing
   - `RESEND_API_KEY`: API key from [Resend](https://resend.com) (for OTP emails)

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. (Optional) Seed the database with initial roles and an admin user:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000/api`.

---

## 🛠 API Usage

### Authentication
Most endpoints require a JWT token.
- **Login**: `POST /api/auth/login` returns a `token`.
- **Authorization Header**: `Authorization: Bearer <token>`

### Core Modules
- **Auth**: Registration, Login, OTP, Password Reset.
- **Users**: User profile management and administrative listing.
- **RBAC**: Management of Roles and Permissions.
- **Audit Logs**: History of system actions.

For full endpoint details, refer to the [openapi.yaml](./openapi.yaml) file.

---

## 📱 Integration Notes for Flutter

- **Base URL**: `http://localhost:3000/api` (use your machine's IP if testing on a physical device).
- **Date Format**: ISO 8601 strings.
- **Pagination**: Use `page` and `pageSize` query parameters. Responses include a `meta` object with total counts.

---

## 🏗 Project Structure

- `app/api/`: API route handlers (Next.js App Router).
- `lib/db/`: Database schema (Drizzle) and migrations.
- `lib/auth/`: JWT and password utilities.
- `lib/validators/`: Zod schemas for request validation.
- `lib/utils/`: Shared utilities (API responses, pagination).
