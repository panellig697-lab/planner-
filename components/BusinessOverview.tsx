"use client";

import type { AppState, Company } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { formatGBP } from "@/lib/format";
import { formatDateShort } from "@/lib/dateUtils";
import { SCHEMAS } from "@/lib/schema";

const STAGES = SCHEMAS.companies.fields.find((f) => f.key === "pipeline_stage")!.options!;

export default function BusinessOverview({
  state,
  mutate,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
}) {
  async function setStage(company: Company, stage: string) {
    await mutate({
      type: "companies",
      action: "update",
      id: company.id,
      properties: { pipeline_stage: stage },
    });
  }

  const clients = state.people.filter((p) => p.relationship === "Client");
  const leads = state.people.filter((p) => p.relationship === "Lead");
  const parked = state.people.filter((p) => p.relationship === "Parked");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="label-caps mb-3">Pipeline</h2>
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
                    <div key={c.id} className="card px-3 py-2.5">
                      <p className="text-sm font-medium text-ink">{c.name}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {c.industry || c.area || "—"}
                      </p>
                      {c.deal_value !== null && (
                        <p className="mt-1 font-mono text-xs text-rust-dark">
                          {formatGBP(c.deal_value)}
                        </p>
                      )}
                      <select
                        value={c.pipeline_stage ?? ""}
                        onChange={(e) => setStage(c, e.target.value)}
                        className="mt-2 w-full rounded-sm border border-line bg-paper px-1.5 py-1 text-xs text-ink"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {companies.length === 0 && (
                    <p className="text-xs italic text-ink-soft">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ContactGroup title="Current Clients" people={clients} />
      <ContactGroup title="Leads" people={leads} />
      <ContactGroup title="Parked" people={parked} />
    </div>
  );
}

function ContactGroup({ title, people }: { title: string; people: AppState["people"] }) {
  return (
    <section>
      <h2 className="label-caps mb-3">{title}</h2>
      {people.length === 0 && <p className="text-sm italic text-ink-soft">None yet.</p>}
      <ul className="space-y-2">
        {people.map((p) => (
          <li key={p.id} className="card flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink">{p.name}</p>
              <p className="text-xs text-ink-soft">{p.role || p.email || "—"}</p>
            </div>
            <span className="text-xs text-ink-soft">{formatDateShort(p.last_contacted)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
