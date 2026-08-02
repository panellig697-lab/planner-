"use client";

import { useCallback, useEffect, useState } from "react";
import { EMPTY_STATE, type AppState } from "./types";
import type { EntityType } from "./schema";

export interface MutatePayload {
  type: EntityType;
  action: "create" | "update";
  id?: string;
  properties: Record<string, unknown>;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load state");
      setState(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load state");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (payload: MutatePayload) => {
      const res = await fetch("/api/mutate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mutation failed");
      await refresh();
      return data as { id: string };
    },
    [refresh]
  );

  return { state, loading, error, refresh, mutate };
}
