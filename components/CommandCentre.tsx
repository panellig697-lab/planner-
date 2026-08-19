"use client";

import { CheckCircle2, Circle, Sparkles, Users2, FolderKanban, Repeat, Bot, Palette, User } from "lucide-react";
import type { AppState } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { byId } from "@/lib/format";
import { formatDateShort, formatDateHeader, isPast, isWithinDays, todayISO } from "@/lib/dateUtils";
import EmptyState from "./ui/EmptyState";
import { SkeletonList } from "./ui/Skeleton";

const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

// Which business an active project belongs to, for the grouped overview —
// the same Area tag Retainr/Clario workspaces read, so this stays in sync
// with them without a second source of truth.
type ProjectGroup = "retainr" | "clario" | "creative" | "personal";
const CREATIVE_AREAS = new Set(["Art", "Photography", "Music"]);
function projectGroup(area: string | null): ProjectGroup {
  if (area === "Retainr") return "retainr";
  if (area === "Clario") return "clario";
  if (area && CREATIVE_AREAS.has(area)) return "creative";
  return "personal";
}
const GROUP_META: Record<ProjectGroup, { label: string; icon: typeof Repeat }> = {
  retainr: { label: "Retainr", icon: Repeat },
  clario: { label: "Clario", icon: Bot },
  creative: { label: "Creative", icon: Palette },
  personal: { label: "Personal", icon: User },
};

export default function CommandCentre({
  state,
  mutate,
  loading,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
}) {
  const projectsById = byId(state.projects);
  const companiesById = byId(state.companies);

  const today = todayISO();

  const openTasks = state.tasks
    .filter((t) => t.status !== "Done")
    .sort((a, b) => {
      const pr = (PRIORITY_RANK[a.priority ?? ""] ?? 3) - (PRIORITY_RANK[b.priority ?? ""] ?? 3);
      if (pr !== 0) return pr;
      const da = a.deadline ?? "9999";
      const db = b.deadline ?? "9999";
      return da.localeCompare(db);
    });

  // "Upcoming" merges everything with a date in the next week that isn't
  // already shown elsewhere: overdue-or-soon follow-ups (this replaces the
  // old standalone "Follow-ups Due This Week" section rather than
  // duplicating it) and project target dates. No calendar/events data
  // feeds this — the app doesn't read or write the Events database at all.
  type UpcomingItem = { id: string; kind: "followup" | "project"; label: string; date: string; meta?: string };
  const upcoming: UpcomingItem[] = [
    ...state.people
      .filter((p) => p.next_follow_up && (isPast(p.next_follow_up) || isWithinDays(p.next_follow_up, 7)))
      .map((p) => ({
        id: `followup-${p.id}`,
        kind: "followup" as const,
        label: p.name,
        date: p.next_follow_up!,
        meta: p.role || (p.company_id[0] ? companiesById.get(p.company_id[0])?.name : undefined),
      })),
    ...state.projects
      .filter((p) => p.target_date && (isPast(p.target_date) || isWithinDays(p.target_date, 7)))
      .map((p) => ({ id: `project-${p.id}`, kind: "project" as const, label: p.name, date: p.target_date! })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const activeProjects = state.projects.filter((p) => p.status === "Active");
  const groupedProjects: Record<ProjectGroup, typeof activeProjects> = {
    retainr: [],
    clario: [],
    creative: [],
    personal: [],
  };
  for (const p of activeProjects) groupedProjects[projectGroup(p.area)].push(p);

  async function toggleDone(taskId: string, currentStatus: string | null) {
    await mutate({
      type: "tasks",
      action: "update",
      id: taskId,
      properties: { status: currentStatus === "Done" ? "Todo" : "Done" },
    });
  }

  const isEmptyLoad = loading && state.tasks.length === 0 && state.people.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{formatDateHeader(today)}</p>
      </div>

      <section>
        <h2 className="label-caps mb-3">Priority Tasks</h2>
        {isEmptyLoad ? (
          <SkeletonList rows={3} />
        ) : openTasks.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing open" description="Clear board — nice work." />
        ) : (
          <ul className="space-y-2">
            {openTasks.slice(0, 12).map((t) => {
              const overdue = isPast(t.deadline);
              const project = t.project_id[0] ? projectsById.get(t.project_id[0]) : undefined;
              const company = t.company_id[0] ? companiesById.get(t.company_id[0]) : undefined;
              return (
                <li key={t.id} className="card flex items-start gap-3 px-3.5 py-3 animate-fade-in">
                  <button
                    onClick={() => toggleDone(t.id, t.status)}
                    className="mt-0.5 shrink-0 text-ink-soft transition hover:text-rust-dark"
                    aria-label="Mark done"
                  >
                    <Circle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{t.task}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                      {t.priority && <Tag>{t.priority}</Tag>}
                      {t.deadline && (
                        <span className={overdue ? "font-semibold text-rust-dark" : ""}>
                          {formatDateShort(t.deadline)}
                        </span>
                      )}
                      {project && <span>· {project.name}</span>}
                      {company && <span>· {company.name}</span>}
                    </div>
                    {t.next_action && (
                      <p className="mt-1 text-xs italic text-ink-soft">→ {t.next_action}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="label-caps mb-3">Upcoming</h2>
        {isEmptyLoad ? (
          <SkeletonList rows={2} />
        ) : upcoming.length === 0 ? (
          <EmptyState icon={Users2} title="Nothing else coming up this week" />
        ) : (
          <ul className="space-y-2">
            {upcoming.slice(0, 12).map((item) => {
              const overdue = isPast(item.date);
              return (
                <li key={item.id} className="card flex items-center justify-between px-3.5 py-3 animate-fade-in">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink-soft">
                      {item.kind === "followup" ? "Follow-up" : "Project due"}
                      {item.meta ? ` · ${item.meta}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs ${overdue ? "font-semibold text-rust-dark" : "text-ink-soft"}`}>
                    {formatDateShort(item.date)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="label-caps mb-3">Active Projects</h2>
        {isEmptyLoad ? (
          <SkeletonList rows={2} />
        ) : activeProjects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No active projects" />
        ) : (
          <div className="space-y-4">
            {(Object.keys(GROUP_META) as ProjectGroup[]).map((group) => {
              const projects = groupedProjects[group];
              if (projects.length === 0) return null;
              const meta = GROUP_META[group];
              return (
                <div key={group}>
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                    <meta.icon className="h-3 w-3" /> {meta.label}
                  </h3>
                  <ul className="space-y-2">
                    {projects.map((p) => (
                      <li key={p.id} className="card px-3.5 py-3 animate-fade-in">
                        <p className="text-sm font-medium text-ink">{p.name}</p>
                        {p.purpose && <p className="mt-0.5 text-xs text-ink-soft">{p.purpose}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!loading && openTasks.length === 0 && upcoming.length === 0 && activeProjects.length === 0 && (
        <div className="flex flex-col items-center gap-2 pt-6 text-center text-ink-soft">
          <Sparkles className="h-5 w-5" strokeWidth={1.5} />
          <p className="text-sm">You're fully caught up.</p>
        </div>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-paper-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
      {children}
    </span>
  );
}
