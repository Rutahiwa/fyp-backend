# UDSM Information Dissemination Platform — Docs Index

This folder contains all planning, schema, API, and integration documentation for the project.

## Documents

| File | Purpose | Audience |
| :--- | :--- | :--- |
| [phase2-implementation-plan.md](./phase2-implementation-plan.md) | Sub-phases, tasks, git commit strategy | Backend developer |
| [database-schemas.md](./database-schemas.md) | All Drizzle table definitions for Phase 2 | Backend developer / AI agents |
| [api-reference.md](./api-reference.md) | Complete API endpoint catalog with request/response | Backend dev + Flutter dev |
| [flutter-integration-guide.md](./flutter-integration-guide.md) | Step-by-step Flutter integration guide | Flutter developer |

## Quick Reference

- **Base URL (local):** `http://localhost:3000/api`
- **Auth:** `Authorization: Bearer <jwt_token>`
- **Admin credentials (dev):** `admin@udsminfo.com` / `rut4shell`
- **Database:** Supabase (PostgreSQL)
- **Push Notifications:** Firebase FCM

## For AI Coding Agents

When using Claude Code or any AI agent on this codebase, point it to this folder first.
The recommended reading order for context is:
1. `phase2-implementation-plan.md` — understand what to build and in what order
2. `database-schemas.md` — the exact schema definitions to implement
3. `api-reference.md` — the exact endpoints to build
4. `flutter-integration-guide.md` — understand what the frontend expects
