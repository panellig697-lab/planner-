"use client";

// Small shared building blocks for "detail" style workspaces (a company, a
// business area, a contact). Extracted out of CompanyWorkspace so the new
// Retainr/Clario area workspaces can reuse the exact same look without a
// second copy of this markup.

import EmptyState from "./EmptyState";
import { FolderKanban } from "lucide-react";

export function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="label-caps mb-1">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-ink-soft">{value}</p>
    </div>
  );
}

export function ListSection<T extends { id: string }>({
  items,
  empty,
  render,
  onClick,
}: {
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
  onClick?: (item: T) => void;
}) {
  if (items.length === 0) {
    return <EmptyState icon={FolderKanban} title={empty} />;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item) =>
        onClick ? (
          <li key={item.id}>
            <button
              onClick={() => onClick(item)}
              className="card flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm"
            >
              {render(item)}
            </button>
          </li>
        ) : (
          <li key={item.id} className="card flex items-center justify-between px-3.5 py-2.5 text-sm">
            {render(item)}
          </li>
        )
      )}
    </ul>
  );
}
