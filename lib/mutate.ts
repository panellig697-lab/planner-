import { getNotionClient } from "./notion";
import { flatToNotionProperties, pageToFlat } from "./notionMap";
import { SCHEMAS, type EntitySchema, type EntityType } from "./schema";

export interface MutateInput {
  type: EntityType;
  action: "create" | "update";
  id?: string;
  properties: Record<string, unknown>;
}

function valuesMatch(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    const sa = new Set((a as unknown[] | undefined) ?? []);
    const sb = new Set((b as unknown[] | undefined) ?? []);
    return sa.size === sb.size && [...sa].every((v) => sb.has(v));
  }
  const na = a === "" || a === undefined ? null : a;
  const nb = b === "" || b === undefined ? null : b;
  return na === nb;
}

/**
 * Re-fetches the page we just wrote and checks each submitted field landed.
 * Notion can return a 200 for a write that didn't actually apply (e.g. the
 * integration has read/query access but lacks "Update content" capability,
 * or — depending on workspace settings — a select value that isn't an
 * existing option). Without this check that failure mode looks identical
 * to success: the API call resolves, but nothing changed.
 */
async function verifyWrite(
  pageId: string,
  submitted: Record<string, unknown>,
  schema: EntitySchema
): Promise<void> {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: pageId } as any);
  const flat = pageToFlat(page, schema);

  const mismatches = Object.keys(submitted).filter(
    (key) => !valuesMatch(submitted[key], flat[key])
  );

  if (mismatches.length > 0) {
    const field = schema.fields.find((f) => f.key === mismatches[0]);
    throw new Error(
      `Notion accepted the write but didn't apply it: "${field?.label ?? mismatches[0]}" is still ` +
        `${JSON.stringify(flat[mismatches[0]])} (expected ${JSON.stringify(submitted[mismatches[0]])}). ` +
        `Check the integration has "Update content" capability at notion.so/my-integrations, and that ` +
        `any select/status value you set already exists as an option on that property in Notion.`
    );
  }
}

export async function mutate(input: MutateInput): Promise<{ id: string }> {
  const schema = SCHEMAS[input.type];
  if (!schema) {
    throw new Error(`Unknown entity type: ${input.type}`);
  }
  const notion = getNotionClient();
  const properties = input.properties ?? {};
  const notionProperties = flatToNotionProperties(properties, schema);

  console.log(`[mutate] ${input.action} ${input.type}${input.id ? ` (${input.id})` : ""}`, notionProperties);

  if (input.action === "create") {
    const page = await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: schema.dataSourceId },
      properties: notionProperties,
    } as any);
    await verifyWrite(page.id, properties, schema);
    return { id: page.id };
  }

  if (input.action === "update") {
    if (!input.id) throw new Error("id is required for update");
    const page = await notion.pages.update({
      page_id: input.id,
      properties: notionProperties,
    } as any);
    await verifyWrite(page.id, properties, schema);
    return { id: page.id };
  }

  throw new Error(`Unknown action: ${input.action}`);
}
