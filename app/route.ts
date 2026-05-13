import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/login", "https://fyp-backend-pi-one.vercel.app"));
}
