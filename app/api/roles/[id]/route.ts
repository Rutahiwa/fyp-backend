// GET /api/roles/:id — Get role with permissions
// PUT /api/roles/:id — Update role
// DELETE /api/roles/:id — Soft delete role
// Implemented in Phase 6
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
