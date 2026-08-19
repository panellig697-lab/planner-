"use client";

import { useMemo, useState } from "react";
import { Star, Camera, Video, Palette, Music2, Lightbulb, FolderKanban, Archive } from "lucide-react";
import type { AppState, CreativeWork } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { SCHEMAS } from "@/lib/schema";
import EntityList from "./EntityList";
import EmptyState from "./ui/EmptyState";
import { SkeletonList } from "./ui/Skeleton";

const SECTIONS = [
  { key: "portfolio", label: "Portfolio", icon: Star },
  { key: "photography", label: "Photography", icon: Camera },
  { key: "videography", label: "Videography", icon: Video },
  { key: "art", label: "Art", icon: Palette },
  { key: "music", label: "Music", icon: Music2 },
  { key: "ideas", label: "Creative Ideas", icon: Lightbulb },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "archive", label: "Archive", icon: Archive },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

const DISCIPLINE_BY_SECTION: Partial<Record<SectionKey, string>> = {
  photography: "Photography",
  videography: "Videography",
  art: "Art",
  music: "Music",
};

export default function CreativeWorkspace({
  state,
  mutate,
  loading,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
}) {
  const [section, setSection] = useState<SectionKey>("portfolio");
  const rows = state.creative;

  const filtered = useMemo(() => {
    const discipline = DISCIPLINE_BY_SECTION[section];
    if (discipline) return rows.filter((r) => r.discipline === discipline);
    if (section === "ideas") return rows.filter((r) => r.status === "Idea");
    if (section === "projects") return rows.filter((r) => r.status === "Active");
    if (section === "archive") return rows.filter((r) => r.status === "Completed" || r.status === "Archived");
    return rows;
  }, [rows, section]);

  const isEmptyLoad = loading && rows.length === 0;

  return (
    <div>
      <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 scrollbar-thin">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
              section === s.key ? "bg-ink text-paper" : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {section === "portfolio" ? (
        isEmptyLoad ? (
          <SkeletonList rows={4} />
        ) : (
          <PortfolioSection state={state} />
        )
      ) : (
        <EntityList
          schema={SCHEMAS.creative}
          rows={filtered as unknown as Record<string, unknown>[]}
          state={state}
          mutate={mutate}
          loading={loading}
          icon={SECTIONS.find((s) => s.key === section)!.icon}
          addLabel={`Add to ${SECTIONS.find((s) => s.key === section)!.label}`}
          newDefaults={{
            discipline: DISCIPLINE_BY_SECTION[section] ?? "",
            status: section === "ideas" ? "Idea" : section === "archive" ? "Archived" : section === "projects" ? "Active" : "",
          }}
          emptyTitle={`Nothing in ${SECTIONS.find((s) => s.key === section)!.label} yet`}
        />
      )}
    </div>
  );
}

/**
 * A curated selection, not everything — only items explicitly marked
 * Featured show here, grouped by their portfolio Category. Toggling
 * Featured happens through the normal edit form (open any item from one of
 * the discipline tabs and check "Featured in Portfolio").
 */
function PortfolioSection({ state }: { state: AppState }) {
  const featured = state.creative.filter((c) => c.featured);

  if (featured.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No portfolio pieces yet"
        description='Open any item in Photography, Videography, Art, or Music and check "Featured in Portfolio" to curate it here.'
      />
    );
  }

  const groups = new Map<string, CreativeWork[]>();
  for (const item of featured) {
    const key = item.category || item.discipline || "Other";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([category, items]) => (
        <section key={category}>
          <h3 className="label-caps mb-2">{category}</h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="card p-3 animate-fade-in">
                <p className="truncate text-sm font-medium text-ink">{item.name || "Untitled"}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{item.discipline || "—"}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-xs text-rust-dark hover:underline"
                  >
                    {item.url.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
