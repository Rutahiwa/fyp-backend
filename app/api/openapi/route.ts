import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Serves the root `openapi.yaml` so Swagger UI can load it from the same origin.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), "openapi.yaml");
  const yaml = readFileSync(filePath, "utf8");
  return new NextResponse(yaml, {
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
