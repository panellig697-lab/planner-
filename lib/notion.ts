import { Client } from "@notionhq/client";

let client: Client | null = null;

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
    });
  }
  return client;
}
