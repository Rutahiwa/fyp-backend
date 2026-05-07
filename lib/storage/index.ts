import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment");
}

// Service role client — server-side only, never exposed to clients
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = "platform-media";
export const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10)) * 1024 * 1024;

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "application/pdf": "FILE",
};
