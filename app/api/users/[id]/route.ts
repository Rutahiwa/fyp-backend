// GET /api/users/:id — Get single user
// PUT /api/users/:id — Update user
// DELETE /api/users/:id — Soft delete user
// Implemented in Phase 3
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}

export async function PUT() {
    return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}

export async function DELETE() {
    return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}
