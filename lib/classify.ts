import { SCHEMAS, ENTITY_TYPES, type EntityType } from "./schema";
import type { AppState } from "./state";

function schemaReference(): string {
  return ENTITY_TYPES.map((type) => {
    const schema = SCHEMAS[type];
    const fields = schema.fields
      .map((f) => {
        let hint = `${f.key}: ${f.type}`;
        if (f.options) hint += ` (one of ${f.options.join(" / ")})`;
        if (f.relation) hint += ` (array of ${f.relation} page ids)`;
        if (f.type === "date") hint += ` (YYYY-MM-DD)`;
        return hint;
      })
      .join(", ");
    return `- "${type}" (title field: ${schema.titleField}): ${fields}`;
  }).join("\n");
}

function stateSnapshot(state: AppState): string {
  return ENTITY_TYPES.map((type) => {
    const schema = SCHEMAS[type];
    const rows = state[type]
      .slice(0, 200)
      .map((row) => `${row.id}: ${String(row[schema.titleField] ?? "")}`)
      .join("; ");
    return `${type}:\n${rows || "(none)"}`;
  }).join("\n\n");
}

interface ClassifyResult {
  type: EntityType;
  action: "create" | "update";
  id?: string;
  properties: Record<string, unknown>;
  summary: string;
}

const TOOL_NAME = "decide_action";

export async function classify(text: string, state: AppState): Promise<ClassifyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local to use Quick Capture."
    );
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const today = new Date().toISOString().slice(0, 10);

  const system = `You triage free-text notes into a Notion-backed second brain. Given a note, decide the single best action: create a new record, or update an existing one (e.g. logging a follow-up, changing a status, adding a task to an existing project).

Today's date is ${today}.

Entity schemas (flat JSON keys — use these exact keys in "properties"):
${schemaReference()}

Current records (id: title) — use these ids for relations or to pick an existing record to update:
${stateSnapshot(state)}

Rules:
- Only set properties you have real values for. Omit anything you're not confident about.
- For relation fields, use bare page ids from the current records list above. Never invent an id.
- Prefer "create" unless the note is clearly about an existing record from the list above.
- Write a short (<20 words) human-readable summary of the action you took.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: text }],
      tools: [
        {
          name: TOOL_NAME,
          description: "Record the classified action to take on the second brain.",
          input_schema: {
            type: "object",
            properties: {
              type: { type: "string", enum: ENTITY_TYPES },
              action: { type: "string", enum: ["create", "update"] },
              id: { type: "string", description: "Required when action is update." },
              properties: {
                type: "object",
                description: "Flat JSON keys matching the target entity's schema.",
              },
              summary: { type: "string" },
            },
            required: ["type", "action", "properties", "summary"],
          },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const toolUse = data.content?.find((block: any) => block.type === "tool_use");
  if (!toolUse) {
    throw new Error("Claude did not return a structured action.");
  }

  const input = toolUse.input as ClassifyResult;
  if (!ENTITY_TYPES.includes(input.type)) {
    throw new Error(`Claude returned an invalid type: ${input.type}`);
  }
  return input;
}
