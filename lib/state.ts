import { getNotionClient } from "./notion";
import { pageToFlat } from "./notionMap";
import { SCHEMAS, ENTITY_TYPES, type EntityType } from "./schema";

export type AppState = Record<EntityType, Record<string, unknown>[]>;

async function queryAll(dataSourceId: string) {
  const notion = getNotionClient();
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const res: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return results;
}

export async function getState(): Promise<AppState> {
  const entries = await Promise.all(
    ENTITY_TYPES.map(async (type) => {
      const schema = SCHEMAS[type];
      const pages = await queryAll(schema.dataSourceId);
      return [type, pages.map((p) => pageToFlat(p, schema))] as const;
    })
  );
  return Object.fromEntries(entries) as AppState;
}
