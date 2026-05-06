import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map(s => s.trim());

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes("*");

  // Handle preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin || "*");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
    return response;
  }

  const response = NextResponse.next();

  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
