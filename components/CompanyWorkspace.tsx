"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  Users,
  PoundSterling,
  StickyNote,
} from "lucide-react";
import type { AppState, Company } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { formatGBP } from "@/lib/format";
import { formatDateLong } from "@/lib/dateUtils";
import EntityForm from "./EntityForm";
import { SCHEMAS } from "@/lib/schema";
import StatTile from "./ui/StatTile";
import { Field, ListSection } from "./ui/DetailBits";

const SECTIONS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "team", label: "Team", icon: Users },
  { key: "financials", label: "Financials", icon: PoundSterling },
  { key: "notes", label: "Notes", icon: StickyNote },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function CompanyWorkspace({
  company,
  state,
  mutate,
  onBack,
}: {
  company: Company;
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  onBack: () => void;
}) {
  const [section, setSection] = useState<SectionKey>("overview");
  const [editing, setEditing] = useState(false);

  const projects = useMemo(
    () => state.projects.filter((p) => p.client_company_id.includes(company.id)),
    [state.projects, company.id]
  );
  const tasks = useMemo(
    () => state.tasks.filter((t) => t.company_id.includes(company.id)),
    [state.tasks, company.id]
  );
  const team = useMemo(
    () => state.people.filter((p) => p.company_id.includes(company.id)),
    [state.people, company.id]
  );

  const openTasks = tasks.filter((t) => t.status !== "Done").length;
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const projectRevenue = projects.reduce((sum, p) => sum + (p.revenue_potential ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Companies
      </button>

      <div className="card mb-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">{company.name}</h2>
            <p className="text-sm text-ink-soft">
              {[company.industry, company.area].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          {company.pipeline_stage && (
            <span className="shrink-0 rounded-full border border-line bg-paper-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              {company.pipeline_stage}
            </span>
          )}
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="mt-4 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-rust/40 hover:text-rust-dark"
        >
          {editing ? "Close editor" : "Edit company"}
        </button>
        {editing && (
          <div className="mt-3">
            <EntityForm
              schema={SCHEMAS.companies}
              state={state}
              initial={company as unknown as Record<string, unknown>}
              onDone={() => setEditing(false)}
              mutate={mutate}
            />
          </div>
        )}
      </div>

      <div className="-mx-4 mb-5 flex gap-1 overflow-x-auto px-4 scrollbar-thin">
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

      {section === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Active Projects" value={String(activeProjects)} />
            <StatTile label="Open Tasks" value={String(openTasks)} />
            <StatTile label="Team" value={String(team.length)} />
            <StatTile label="Deal Value" value={formatGBP(company.deal_value)} />
          </div>
          <Field label="Opportunity" value={company.opportunity} />
          <Field label="Problems Identified" value={company.problems_identified} />
          <Field label="Solutions Offered" value={company.solutions_offered} />
          <Field label="Revenue Note" value={company.revenue_note} />
          <div className="grid grid-cols-2 gap-3 text-xs text-ink-soft sm:grid-cols-3">
            <div>
              <p className="label-caps">Source</p>
              <p className="mt-0.5 text-ink">{company.source || "—"}</p>
            </div>
            <div>
              <p className="label-caps">Last Contacted</p>
              <p className="mt-0.5 text-ink">{formatDateLong(company.last_contacted)}</p>
            </div>
            <div>
              <p className="label-caps">Website</p>
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="mt-0.5 block text-rust-dark hover:underline">
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <p className="mt-0.5 text-ink">—</p>
              )}
            </div>
          </div>
        </div>
      )}

      {section === "projects" && (
        <ListSection
          items={projects}
          empty="No projects linked to this company yet."
          render={(p) => (
            <>
              <span className="text-ink">{p.name}</span>
              {p.status && <span className="text-xs text-ink-soft">{p.status}</span>}
            </>
          )}
        />
      )}

      {section === "tasks" && (
        <ListSection
          items={tasks}
          empty="No tasks linked to this company yet."
          render={(t) => (
            <>
              <span className="text-ink">{t.task}</span>
              {t.priority && <span className="text-xs text-ink-soft">{t.priority}</span>}
            </>
          )}
        />
      )}

      {section === "team" && (
        <ListSection
          items={team}
          empty="No people linked to this company yet."
          render={(p) => (
            <>
              <span className="text-ink">{p.name}</span>
              <span className="text-xs text-ink-soft">{p.role || p.relationship || ""}</span>
            </>
          )}
        />
      )}

      {section === "financials" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Deal Value" value={formatGBP(company.deal_value)} />
          <StatTile label="Project Revenue Potential" value={formatGBP(projectRevenue || null)} />
          <StatTile label="Pipeline Stage" value={company.pipeline_stage || "—"} />
        </div>
      )}

      {section === "notes" && (
        <div className="space-y-3">
          <Field label="Revenue Note" value={company.revenue_note} />
          <Field label="Problems Identified" value={company.problems_identified} />
          <Field label="Solutions Offered" value={company.solutions_offered} />
        </div>
      )}
    </div>
  );
}
