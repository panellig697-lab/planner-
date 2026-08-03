import type { EntitySchema, FieldDef } from "./schema";

// A Notion page's `properties` object, typed loosely — the SDK's generated
// types are a large discriminated union that isn't worth importing here.
type NotionProperties = Record<string, any>;

function dateOnly(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

function readProperty(prop: any, field: FieldDef): unknown {
  if (!prop) return field.type === "relation" || field.type === "multiselect" ? [] : null;
  switch (field.type) {
    case "title":
      return (prop.title ?? []).map((t: any) => t.plain_text).join("") || "";
    case "text":
      return (prop.rich_text ?? []).map((t: any) => t.plain_text).join("") || "";
    case "email":
      return prop.email ?? null;
    case "phone":
      return prop.phone_number ?? null;
    case "url":
      return prop.url ?? null;
    case "number":
      return prop.number ?? null;
    case "select":
      return prop.select?.name ?? null;
    case "multiselect":
      return (prop.multi_select ?? []).map((s: any) => s.name);
    case "date":
      return dateOnly(prop.date?.start ?? null);
    case "relation":
      return (prop.relation ?? []).map((r: any) => r.id);
    default:
      return null;
  }
}

/** Flattens a Notion page object into the simplified JSON shape the frontend renders against. */
export function pageToFlat(page: any, schema: EntitySchema): Record<string, unknown> {
  const flat: Record<string, unknown> = { id: page.id };
  for (const field of schema.fields) {
    flat[field.key] = readProperty(page.properties?.[field.notionProp], field);
  }
  return flat;
}

function writeProperty(value: unknown, field: FieldDef): unknown {
  switch (field.type) {
    case "title":
      return { title: value ? [{ text: { content: String(value) } }] : [] };
    case "text":
      return { rich_text: value ? [{ text: { content: String(value) } }] : [] };
    case "email":
      return { email: value ? String(value) : null };
    case "phone":
      return { phone_number: value ? String(value) : null };
    case "url":
      return { url: value ? String(value) : null };
    case "number":
      return { number: value === "" || value === null || value === undefined ? null : Number(value) };
    case "select":
      return { select: value ? { name: String(value) } : null };
    case "multiselect":
      return { multi_select: Array.isArray(value) ? value.map((v) => ({ name: String(v) })) : [] };
    case "date":
      return { date: value ? { start: String(value) } : null };
    case "relation":
      return { relation: Array.isArray(value) ? value.map((id) => ({ id: String(id) })) : [] };
    default:
      return null;
  }
}

/**
 * Translates a partial simplified `properties` object (from /api/mutate's body)
 * into Notion's property-update format. Only keys present in `properties` are
 * included, so this doubles as a partial-update builder.
 */
export function flatToNotionProperties(
  properties: Record<string, unknown>,
  schema: EntitySchema
): NotionProperties {
  const notionProps: NotionProperties = {};
  for (const field of schema.fields) {
    if (!(field.key in properties)) continue;
    notionProps[field.notionProp] = writeProperty(properties[field.key], field);
  }
  return notionProps;
}
