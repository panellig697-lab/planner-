import { getNotionClient } from "./notion";
import { pageToFlat } from "./notionMap";
import { SCHEMAS, ENTITY_TYPES, type EntityType, type EntitySchema } from "./schema";

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

/**
 * Flattens one entity type's pages one row at a time, instead of a single
 * `pages.map(pageToFlat)`. That version had every row for a type share one
 * failure mode: if any single page threw while flattening (an unexpected
 * property shape, a partial/restricted page object missing `properties`,
 * etc.), the exception propagated out of the Promise.all in getState() and
 * the *entire* /api/state response 500'd — every tab, not just the one
 * with the bad row — with nothing in the logs pointing at which page or
 * property caused it. Now a bad row is caught, logged with its id and the
 * entity type so it can be found in Notion, and skipped — the rest of that
 * list (and every other tab) still loads.
 */
function flattenPages(
  pages: any[],
  type: EntityType,
  schema: EntitySchema
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (const page of pages) {
    try {
      rows.push(pageToFlat(page, schema));
    } catch (err) {
      console.error(
        `getState: failed to flatten a "${type}" page (id=${page?.id ?? "unknown"}) — skipping this row so the rest of the list still loads.`,
        err
      );
    }
  }
  return rows;
}

export async function getState(): Promise<AppState> {
  const entries = await Promise.all(
    ENTITY_TYPES.map(async (type) => {
      const schema = SCHEMAS[type];
      const pages = await queryAll(schema.dataSourceId);
      return [type, flattenPages(pages, type, schema)] as const;
    })
  );
  return Object.fromEntries(entries) as AppState;
}
