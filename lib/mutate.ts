import { getNotionClient } from "./notion";
import { flatToNotionProperties } from "./notionMap";
import { SCHEMAS, type EntityType } from "./schema";

export interface MutateInput {
  type: EntityType;
  action: "create" | "update";
  id?: string;
  properties: Record<string, unknown>;
}

export async function mutate(input: MutateInput): Promise<{ id: string }> {
  const schema = SCHEMAS[input.type];
  if (!schema) {
    throw new Error(`Unknown entity type: ${input.type}`);
  }
  const notion = getNotionClient();
  const notionProperties = flatToNotionProperties(input.properties ?? {}, schema);

  if (input.action === "create") {
    const page = await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: schema.dataSourceId },
      properties: notionProperties,
    } as any);
    return { id: page.id };
  }

  if (input.action === "update") {
    if (!input.id) throw new Error("id is required for update");
    const page = await notion.pages.update({
      page_id: input.id,
      properties: notionProperties,
    } as any);
    return { id: page.id };
  }

  throw new Error(`Unknown action: ${input.action}`);
}
