"use client";

import { useState } from "react";
import {
  ArrowLeft,
  PoundSterling,
  Building2,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
} from "lucide-react";
import type { AppState, Company } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { formatGBP } from "@/lib/format";
import { formatDateShort, isPast } from "@/lib/dateUtils";
import { SCHEMAS } from "@/lib/schema";
import CompanyWorkspace from "./CompanyWorkspace";
import StatTile from "./ui/StatTile";
import EmptyState from "./ui/EmptyState";
import { SkeletonGrid } from "./ui/Skeleton";

const STAGES = SCHEMAS.companies.fields.find((f) => f.key === "pipeline_stage")!.options!;

type Section = "finance" | "companies" | "projects" | "tasks" | "crm" | "metrics";

const CARDS: { key: Section; label: string; icon: typeof PoundSterling; blurb: string }[] = [
  { key: "finance", label: "Finance", icon: PoundSterling, blurb: "Pipeline value & revenue" },
  { key: "companies", label: "Companies", icon: Building2, blurb: "Pipeline board" },
  { key: "projects", label: "Projects", icon: FolderKanban, blurb: "All projects" },
  { key: "tasks", label: "Tasks", icon: CheckSquare, blurb: "Open work" },
  { key: "crm", label: "CRM", icon: Users, blurb: "Clients, leads, parked" },
  { key: "metrics", label: "Metrics", icon: BarChart3, blurb: "Business at a glance" },
];

export default function BusinessOverview({
  state,
  mutate,
  loading,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
}) {
  const [section, setSection] = useState<Section | null>(null);
  const [openCompany, setOpenCompany] = useState<Company | null>(null);

  if (openCompany) {
    return (
      <CompanyWorkspace
        company={openCompany}
        state={state}
        mutate={mutate}
        onBack={() => setOpenCompany(null)}
      />
    );
  }

  if (loading && state.companies.length === 0 && state.people.length === 0) {
    return <SkeletonGrid tiles={6} />;
  }

  if (!section) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CARDS.map((c) => (
          <button
            key={c.key}
            onClick={() => setSection(c.key)}
            className="card animate-fade-in flex flex-col items-start gap-2 p-4 text-left"
          >
            <c.icon className="h-5 w-5 text-rust-dark" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-ink">{c.label}</span>
            <span className="text-xs text-ink-soft">{c.blurb}</span>
          </button>
        ))}
      </div>
    );
  }

  const card = CARDS.find((c) => c.key === section)!;

  return (
    <div>
      <button
        onClick={() => setSection(null)}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Business
      </button>
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
        <card.icon className="h-4 w-4 text-rust-dark" /> {card.label}
      </h2>

      {section === "finance" && <FinanceSection state={state} />}
      {section === "companies" && (
        <PipelineBoard state={state} mutate={mutate} onOpenCompany={setOpenCompany} />
      )}
      {section === "projects" && <ProjectsSection state={state} />}
      {section === "tasks" && <TasksSection state={state} />}
      {section === "crm" && <CrmSection state={state} />}
      {section === "metrics" && <MetricsSection state={state} />}
    </div>
  );
}

function FinanceSection({ state }: { state: AppState }) {
  const pipelineValue = state.companies.reduce((s, c) => s + (c.deal_value ?? 0), 0);
  const wonValue = state.companies
    .filter((c) => c.pipeline_stage === "Converted")
    .reduce((s, c) => s + (c.deal_value ?? 0), 0);
  const projectRevenue = state.projects.reduce((s, p) => s + (p.revenue_potential ?? 0), 0);
  const activeProjectRevenue = state.projects
    .filter((p) => p.status === "Active")
    .reduce((s, p) => s + (p.revenue_potential ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Pipeline Value" value={formatGBP(pipelineValue)} hint="all companies" />
        <StatTile label="Won Revenue" value={formatGBP(wonValue)} hint="converted deals" />
        <StatTile label="Project Revenue Potential" value={formatGBP(projectRevenue)} />
        <StatTile label="Active Project Revenue" value={formatGBP(activeProjectRevenue)} />
      </div>
      <div>
        <h3 className="label-caps mb-2">Deal Value by Company</h3>
        <ul className="space-y-1.5">
          {state.companies
            .filter((c) => c.deal_value)
            .sort((a, b) => (b.deal_value ?? 0) - (a.deal_value ?? 0))
            .map((c) => (
              <li key={c.id} className="card flex items-center justify-between px-3.5 py-2.5 text-sm">
                <span className="text-ink">{c.name}</span>
                <span className="font-mono text-rust-dark">{formatGBP(c.deal_value)}</span>
              </li>
            ))}
          {state.companies.every((c) => !c.deal_value) && (
            <EmptyState icon={PoundSterling} title="No deal values recorded yet" />
          )}
        </ul>
      </div>
    </div>
  );
}

function PipelineBoard({
  state,
  mutate,
  onOpenCompany,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  onOpenCompany: (c: Company) => void;
}) {
  async function setStage(company: Company, stage: string) {
    await mutate({
      type: "companies",
      action: "update",
      id: company.id,
      properties: { pipeline_stage: stage },
    });
  }

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-thin">
      {STAGES.map((stage) => {
        const companies = state.companies.filter((c) => c.pipeline_stage === stage);
        return (
          <div key={stage} className="w-56 shrink-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps">{stage}</span>
              <span className="text-xs text-ink-soft">{companies.length}</span>
            </div>
            <div className="space-y-2">
              {companies.map((c) => (
                <div key={c.id} className="card px-3.5 py-3 animate-fade-in">
                  <button onClick={() => onOpenCompany(c)} className="block w-full text-left">
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{c.industry || c.area || "—"}</p>
                    {c.deal_value !== null && (
                      <p className="mt-1 font-mono text-xs text-rust-dark">{formatGBP(c.deal_value)}</p>
                    )}
                  </button>
                  <select
                    value={c.pipeline_stage ?? ""}
                    onChange={(e) => setStage(c, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-line bg-paper px-1.5 py-1 text-xs text-ink"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {companies.length === 0 && <p className="text-xs italic text-ink-soft/70">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectsSection({ state }: { state: AppState }) {
  const companiesById = new Map(state.companies.map((c) => [c.id, c]));
  if (state.projects.length === 0) {
    return <EmptyState icon={FolderKanban} title="No projects yet" />;
  }
  return (
    <ul className="space-y-1.5">
      {state.projects.map((p) => {
        const company = p.client_company_id[0] ? companiesById.get(p.client_company_id[0]) : undefined;
        return (
          <li key={p.id} className="card flex items-center justify-between px-3.5 py-2.5 text-sm">
            <div>
              <p className="text-ink">{p.name}</p>
              <p className="text-xs text-ink-soft">{company?.name || p.area || "—"}</p>
            </div>
            {p.status && (
              <span className="rounded-full border border-line bg-paper-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                {p.status}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function TasksSection({ state }: { state: AppState }) {
  const openTasks = state.tasks
    .filter((t) => t.status !== "Done")
    .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
  if (openTasks.length === 0) {
    return <EmptyState icon={CheckSquare} title="Nothing open" />;
  }
  return (
    <ul className="space-y-1.5">
      {openTasks.map((t) => (
        <li key={t.id} className="card flex items-center justify-between px-3.5 py-2.5 text-sm">
          <span className="text-ink">{t.task}</span>
          <span className={`text-xs ${isPast(t.deadline) ? "font-semibold text-rust-dark" : "text-ink-soft"}`}>
            {formatDateShort(t.deadline)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CrmSection({ state }: { state: AppState }) {
  const clients = state.people.filter((p) => p.relationship === "Client");
  const leads = state.people.filter((p) => p.relationship === "Lead");
  const parked = state.people.filter((p) => p.relationship === "Parked");
  return (
    <div className="space-y-6">
      <ContactGroup title="Current Clients" people={clients} />
      <ContactGroup title="Leads" people={leads} />
      <ContactGroup title="Parked" people={parked} />
    </div>
  );
}

function ContactGroup({ title, people }: { title: string; people: AppState["people"] }) {
  return (
    <section>
      <h3 className="label-caps mb-2">{title}</h3>
      {people.length === 0 ? (
        <p className="text-sm italic text-ink-soft/70">None yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {people.map((p) => (
            <li key={p.id} className="card flex items-center justify-between px-3.5 py-2.5 text-sm">
              <div>
                <p className="text-ink">{p.name}</p>
                <p className="text-xs text-ink-soft">{p.role || p.email || "—"}</p>
              </div>
              <span className="text-xs text-ink-soft">{formatDateShort(p.last_contacted)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MetricsSection({ state }: { state: AppState }) {
  const pipelineValue = state.companies.reduce((s, c) => s + (c.deal_value ?? 0), 0);
  const overdue = state.tasks.filter((t) => t.status !== "Done" && isPast(t.deadline)).length;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatTile label="Companies" value={String(state.companies.length)} />
      <StatTile label="People" value={String(state.people.length)} />
      <StatTile label="Active Projects" value={String(state.projects.filter((p) => p.status === "Active").length)} />
      <StatTile label="Open Tasks" value={String(state.tasks.filter((t) => t.status !== "Done").length)} />
      <StatTile label="Overdue Tasks" value={String(overdue)} />
      <StatTile label="Pipeline Value" value={formatGBP(pipelineValue)} />
    </div>
  );
}
