import { Client } from "@notionhq/client";

let client: Client | null = null;

/**
 * The SDK defaults to `fetch.bind(globalThis)` (confirmed by reading its
 * installed source — it isn't documented). On Vercel/Next.js that global
 * `fetch` is Next's own patched version, which caches by default unless the
 * *calling route* opts out (`export const dynamic = "force-dynamic"`).
 * Every route here already does that, so this SDK's calls should already
 * be forced to `no-store` via that per-request context — but that's an
 * implicit dependency on every future route remembering the segment
 * config, and on Next/Vercel's propagation behavior not changing. Passing
 * an explicit `cache: "no-store"` fetch here makes it true unconditionally,
 * at the one place all Notion reads and writes funnel through, instead of
 * relying on that propagation.
 */
function noStoreFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: "no-store" });
}

export function getNotionClient(): Client {
  if (!process.env.NOTION_API_KEY) {
    throw new Error(
      "NOTION_API_KEY is not set. Add it to .env.local — see .env.local.example."
    );
  }
  if (!client) {
    // The SDK's default is 60s per request with up to 2 retries (backoff up
    // to 60s each) — worst case, minutes. Serverless hosts (Vercel's Hobby
    // tier included) kill the function well before that, dropping the
    // connection with no clean response, which looks like an infinite
    // "Saving…" with no error. Bound it well under any platform's function
    // timeout so a slow/rate-limited call fails fast and visibly instead.
    client = new Client({
      auth: process.env.NOTION_API_KEY,
      timeoutMs: 10_000,
      retry: { maxRetries: 1, maxRetryDelayMs: 2_000 },
      fetch: noStoreFetch,
    });
  }
  return client;
}
