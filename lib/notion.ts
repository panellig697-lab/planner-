import { Client } from "@notionhq/client";

let client: Client | null = null;

export function getNotionClient(): Client {
  if (!process.env.NOTION_API_KEY) {
    throw new Error(
      "NOTION_API_KEY is not set. Add it to .env.local — see .env.local.example."
    );
  }
  if (!client) {
    client = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return client;
}
