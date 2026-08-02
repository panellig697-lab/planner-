"use client";

import type { AppState } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { byId } from "@/lib/format";
import { formatDateShort, isPast, isWithinDays } from "@/lib/dateUtils";

const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export default function CommandCentre({
  state,
  mutate,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
}) {
  const projectsById = byId(state.projects);
  const companiesById = byId(state.companies);
  const peopleById = byId(state.people);

  const openTasks = state.tasks
    .filter((t) => t.status !== "Done")
    .sort((a, b) => {
      const pr = (PRIORITY_RANK[a.priority ?? ""] ?? 3) - (PRIORITY_RANK[b.priority ?? ""] ?? 3);
      if (pr !== 0) return pr;
      const da = a.deadline ?? "9999";
      const db = b.deadline ?? "9999";
      return da.localeCompare(db);
    });

  const followUps = state.people
    .filter((p) => p.next_follow_up && (isPast(p.next_follow_up) || isWithinDays(p.next_follow_up, 7)))
    .sort((a, b) => (a.next_follow_up ?? "").localeCompare(b.next_follow_up ?? ""));

  const activeProjects = state.projects.filter((p) => p.status === "Active");

  async function toggleDone(taskId: string, currentStatus: string | null) {
    await mutate({
      type: "tasks",
      action: "update",
      id: taskId,
      properties: { status: currentStatus === "Done" ? "Todo" : "Done" },
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="label-caps mb-3">Priority Tasks</h2>
        {openTasks.length === 0 && <EmptyNote text="Nothing open — clear board." />}
        <ul className="space-y-2">
          {openTasks.slice(0, 12).map((t) => {
            const overdue = isPast(t.deadline);
            const project = t.project_id[0] ? projectsById.get(t.project_id[0]) : undefined;
            const company = t.company_id[0] ? companiesById.get(t.company_id[0]) : undefined;
            return (
              <li key={t.id} className="card flex items-start gap-3 px-3 py-2.5">
                <button
                  onClick={() => toggleDone(t.id, t.status)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-ink-soft"
                  aria-label="Toggle done"
                />
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
      </section>

      <section>
        <h2 className="label-caps mb-3">Follow-ups Due This Week</h2>
        {followUps.length === 0 && <EmptyNote text="No follow-ups pending." />}
        <ul className="space-y-2">
          {followUps.map((p) => {
            const company = p.company_id[0] ? companiesById.get(p.company_id[0]) : undefined;
            const overdue = isPast(p.next_follow_up);
            return (
              <li key={p.id} className="card flex items-center justify-between px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-soft">
                    {p.role || company?.name || "—"}
                  </p>
                </div>
                <span className={`text-xs ${overdue ? "font-semibold text-rust-dark" : "text-ink-soft"}`}>
                  {formatDateShort(p.next_follow_up)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="label-caps mb-3">Active Projects</h2>
        {activeProjects.length === 0 && <EmptyNote text="No active projects." />}
        <ul className="space-y-2">
          {activeProjects.map((p) => {
            const person = p.client_person_id[0] ? peopleById.get(p.client_person_id[0]) : undefined;
            const company = p.client_company_id[0] ? companiesById.get(p.client_company_id[0]) : undefined;
            return (
              <li key={p.id} className="card px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  {p.area && <Tag>{p.area}</Tag>}
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  {[person?.name, company?.name].filter(Boolean).join(" · ") || p.purpose || "—"}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-line bg-paper-dark px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
      {children}
    </span>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm italic text-ink-soft">{text}</p>;
}
