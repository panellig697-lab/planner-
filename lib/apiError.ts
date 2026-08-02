/** Formats a caught error into a message that includes the Notion API's
 * error code when available, so permission/validation failures (a stale
 * relation, a missing select option, an integration without update
 * capability, etc.) are diagnosable from the message alone instead of
 * collapsing into a generic "failed" string. */
export function formatApiError(err: unknown): string {
  const e = err as { message?: string; code?: string; status?: number };
  if (e?.code) {
    return `${e.message ?? "Request failed"} (${e.code}${e.status ? `, HTTP ${e.status}` : ""})`;
  }
  return e?.message ?? "Unexpected error";
}
