// Co-brand value validators — mirror guardian's server-side rules so the front never
// trusts a network value blindly (defense-in-depth) and the editor matches the backend
// contract (which accepts ONLY #RRGGBB, not the 3-digit shorthand).

/** A #RRGGBB hex colour (6 digits only, like guardian). */
export function isHexColor(v: string | null | undefined): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

/** An http(s) URL, ≤2048 chars — matches guardian's logo_url validation. */
export function isHttpUrl(v: string | null | undefined): v is string {
  if (typeof v !== "string" || v.length === 0 || v.length > 2048) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
