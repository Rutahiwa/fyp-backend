// GET /api/permissions/:id — Get permission
// PUT /api/permissions/:id — Update permission
// DELETE /api/permissions/:id — Soft delete permission
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
