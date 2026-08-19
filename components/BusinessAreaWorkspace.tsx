"use client";

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  Users,
  Building2,
  PoundSterling,
  StickyNote,
  Plus,
} from "lucide-react";
import type { AppState } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { formatGBP } from "@/lib/format";
import EntityForm from "./EntityForm";
import { SCHEMAS } from "@/lib/schema";
import StatTile from "./ui/StatTile";
import { Field, ListSection } from "./ui/DetailBits";
import { SkeletonGrid } from "./ui/Skeleton";

const SECTIONS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "team", label: "Team", icon: Users },
  { key: "companies", label: "Leads/Companies", icon: Building2 },
  { key: "financials", label: "Financials", icon: PoundSterling },
  { key: "notes", label: "Notes", icon: StickyNote },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

/**
 * A dedicated top-level workspace for one business (Retainr, Clario) that
 * isn't its own database — it's a company row in Companies plus an "Area"
 * tag shared by Projects/Companies. Those two signals don't always overlap
 * in the real data (a project can be tagged Area = Retainr without being
 * relation-linked to the "Retainr" company row, and vice versa), so this
 * merges both rather than trusting either alone — a pure company-relation
 * view would silently show zero projects here even though real ones exist.
 */
export default function BusinessAreaWorkspace({
  label,
  companyName,
  areaValue,
  icon: Icon,
  state,
  mutate,
  loading,
}: {
  label: string;
  companyName: string;
  areaValue: string;
  icon: typeof LayoutGrid;
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
}) {
  const [section, setSection] = useState<SectionKey>("overview");
  const [editingCompany, setEditingCompany] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const company = useMemo(
    () => state.companies.find((c) => c.name.trim().toLowerCase() === companyName.toLowerCase()),
    [state.companies, companyName]
  );

  const projects = useMemo(() => {
    const seen = new Set<string>();
    return state.projects.filter((p) => {
      const belongs = (company && p.client_company_id.includes(company.id)) || p.area === areaValue;
      if (!belongs || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [state.projects, company, areaValue]);

  const projectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects]);

  const tasks = useMemo(() => {
    const seen = new Set<string>();
    return state.tasks.filter((t) => {
      const belongs =
        (company && t.company_id.includes(company.id)) || t.project_id.some((pid) => projectIds.has(pid));
      if (!belongs || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [state.tasks, company, projectIds]);

  // Other companies tagged this area (leads/prospects not yet the named
  // company itself) — a lightweight stand-in for a dedicated pipeline until
  // this business has more than one company row of its own.
  const relatedCompanies = useMemo(
    () => state.companies.filter((c) => c.area === areaValue && c.id !== company?.id),
    [state.companies, areaValue, company]
  );

  const team = useMemo(
    () => (company ? state.people.filter((p) => p.company_id.includes(company.id)) : []),
    [state.people, company]
  );

  const openTasks = tasks.filter((t) => t.status !== "Done").length;
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const projectRevenue = projects.reduce((sum, p) => sum + (p.revenue_potential ?? 0), 0);
  const pipelineValue = relatedCompanies.reduce((sum, c) => sum + (c.deal_value ?? 0), 0);

  if (loading && state.companies.length === 0 && state.projects.length === 0) {
    return <SkeletonGrid tiles={4} />;
  }

  return (
    <div className="animate-fade-in">
      <div className="card mb-5 p-5">
        <div className="flex items-center gap-2.5">
          <Icon className="h-5 w-5 text-rust-dark" strokeWidth={1.75} />
          <div>
            <h2 className="text-lg font-semibold text-ink">{label}</h2>
            <p className="text-sm text-ink-soft">
              {company ? [company.industry, company.pipeline_stage].filter(Boolean).join(" · ") || "Independent workspace" : "Independent workspace"}
            </p>
          </div>
        </div>

        {company ? (
          <>
            <button
              onClick={() => setEditingCompany((e) => !e)}
              className="mt-4 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-rust/40 hover:text-rust-dark"
            >
              {editingCompany ? "Close editor" : `Edit ${label} profile`}
            </button>
            {editingCompany && (
              <div className="mt-3">
                <EntityForm
                  schema={SCHEMAS.companies}
                  state={state}
                  initial={company as unknown as Record<string, unknown>}
                  onDone={() => setEditingCompany(false)}
                  mutate={mutate}
                />
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-xs text-ink-soft">
            No company named "{companyName}" found in Companies yet — add one there to unlock a profile,
            financials, and team here. Projects and tasks tagged Area = {areaValue} still show below.
          </p>
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
            <StatTile label="Pipeline Value" value={formatGBP(pipelineValue || null)} />
          </div>
          <Field label="Opportunity" value={company?.opportunity} />
          <Field label="Problems Identified" value={company?.problems_identified} />
          <Field label="Solutions Offered" value={company?.solutions_offered} />
          {!company?.opportunity && !company?.problems_identified && !company?.solutions_offered && (
            <p className="text-sm italic text-ink-soft/70">
              No notes on the {label} profile yet — add them via "Edit {label} profile" above.
            </p>
          )}
        </div>
      )}

      {section === "projects" && (
        <div className="space-y-3">
          {!addingProject ? (
            <button
              onClick={() => setAddingProject(true)}
              className="flex items-center gap-1 rounded-lg bg-rust px-3 py-1.5 text-sm font-medium text-paper shadow-soft transition hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Add Project
            </button>
          ) : (
            <EntityForm
              schema={SCHEMAS.projects}
              state={state}
              initial={company ? { area: areaValue, client_company_id: [company.id] } : { area: areaValue }}
              onDone={() => setAddingProject(false)}
              mutate={mutate}
            />
          )}
          <ListSection
            items={projects}
            empty={`No projects tagged ${areaValue} yet.`}
            render={(p) => (
              <>
                <span className="text-ink">{p.name}</span>
                {p.status && <span className="text-xs text-ink-soft">{p.status}</span>}
              </>
            )}
          />
        </div>
      )}

      {section === "tasks" && (
        <div className="space-y-3">
          {!addingTask ? (
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-1 rounded-lg bg-rust px-3 py-1.5 text-sm font-medium text-paper shadow-soft transition hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Add Task
            </button>
          ) : (
            <EntityForm
              schema={SCHEMAS.tasks}
              state={state}
              initial={company ? { company_id: [company.id] } : {}}
              onDone={() => setAddingTask(false)}
              mutate={mutate}
            />
          )}
          <ListSection
            items={tasks}
            empty="No tasks linked to this business yet."
            render={(t) => (
              <>
                <span className="text-ink">{t.task}</span>
                {t.priority && <span className="text-xs text-ink-soft">{t.priority}</span>}
              </>
            )}
          />
        </div>
      )}

      {section === "team" && (
        <ListSection
          items={team}
          empty={company ? "No people linked to this company yet." : "Add a company profile above to link team members."}
          render={(p) => (
            <>
              <span className="text-ink">{p.name}</span>
              <span className="text-xs text-ink-soft">{p.role || p.relationship || ""}</span>
            </>
          )}
        />
      )}

      {section === "companies" && (
        <ListSection
          items={relatedCompanies}
          empty={`No other companies tagged Area = ${areaValue} yet.`}
          render={(c) => (
            <>
              <span className="text-ink">{c.name}</span>
              {c.pipeline_stage && <span className="text-xs text-ink-soft">{c.pipeline_stage}</span>}
            </>
          )}
        />
      )}

      {section === "financials" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Deal Value" value={formatGBP(company?.deal_value ?? null)} />
          <StatTile label="Project Revenue Potential" value={formatGBP(projectRevenue || null)} />
          <StatTile label="Pipeline Value (leads)" value={formatGBP(pipelineValue || null)} />
        </div>
      )}

      {section === "notes" && (
        <div className="space-y-3">
          <Field label="Revenue Note" value={company?.revenue_note} />
          <Field label="Problems Identified" value={company?.problems_identified} />
          <Field label="Solutions Offered" value={company?.solutions_offered} />
          {!company?.revenue_note && !company?.problems_identified && !company?.solutions_offered && (
            <p className="text-sm italic text-ink-soft/70">No notes yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
