import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-ink-soft/60" strokeWidth={1.5} />
      <p className="text-sm font-medium text-ink-soft">{title}</p>
      {description && <p className="max-w-xs text-xs text-ink-soft/80">{description}</p>}
    </div>
  );
}
