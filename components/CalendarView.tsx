"use client";

import { useMemo, useState } from "react";
import type { AppState } from "@/lib/types";
import { monthLabel, todayISO, WEEKDAY } from "@/lib/dateUtils";

interface DayItem {
  id: string;
  label: string;
  kind: "task" | "event";
}

export default function CalendarView({ state }: { state: AppState }) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const itemsByDate = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    for (const t of state.tasks) {
      if (!t.deadline) continue;
      const list = map.get(t.deadline) ?? [];
      list.push({ id: t.id, label: t.task, kind: "task" });
      map.set(t.deadline, list);
    }
    for (const e of state.events) {
      if (!e.date) continue;
      const list = map.get(e.date) ?? [];
      list.push({ id: e.id, label: e.title, kind: "event" });
      map.set(e.date, list);
    }
    return map;
  }, [state.tasks, state.events]);

  const firstOfMonth = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const cells: (string | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(iso);
  }

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="label-caps px-2 py-1 hover:text-rust-dark">
          ← Prev
        </button>
        <h2 className="font-serif text-lg font-semibold text-ink">
          {monthLabel(cursor.year, cursor.month)}
        </h2>
        <button onClick={() => shiftMonth(1)} className="label-caps px-2 py-1 hover:text-rust-dark">
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY.map((w) => (
          <div key={w} className="label-caps py-1">
            {w}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const items = itemsByDate.get(iso) ?? [];
          const isToday = iso === today;
          const day = Number(iso.slice(-2));
          return (
            <div
              key={iso}
              className={`card flex min-h-[68px] flex-col items-start p-1.5 text-left ${
                isToday ? "border-rust" : ""
              }`}
            >
              <span className={`text-xs ${isToday ? "font-bold text-rust-dark" : "text-ink-soft"}`}>
                {day}
              </span>
              <div className="mt-0.5 w-full space-y-0.5 overflow-hidden">
                {items.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className={`truncate rounded-sm px-1 py-0.5 text-[10px] leading-tight ${
                      item.kind === "task"
                        ? "bg-paper-dark text-ink-soft"
                        : "bg-rust/10 text-rust-dark"
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-[10px] text-ink-soft">+{items.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
