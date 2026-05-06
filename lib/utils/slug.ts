import crypto from "crypto";

/**
 * Generates a URL-safe slug from a text string.
 * Lowercases, trims, replaces non-alphanumeric characters with hyphens,
 * collapses consecutive hyphens, and appends a short random suffix for uniqueness.
 *
 * @param text - The text to slugify (e.g. an announcement title)
 * @param suffixLength - Length of random hex suffix (default: 4)
 * @returns URL-safe slug string
 */
export function generateSlug(text: string, suffixLength: number = 4): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

  const suffix = crypto.randomBytes(suffixLength).toString("hex").slice(0, suffixLength * 2);

  return `${base}-${suffix}`;
}
