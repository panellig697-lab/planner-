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

function patchState(
  state: AppState,
  type: EntityType,
  id: string,
  properties: Record<string, unknown>
): AppState {
  const rows = state[type] as unknown as Record<string, unknown>[];
  return {
    ...state,
    [type]: rows.map((row) => (row.id === id ? { ...row, ...properties } : row)),
  };
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
      // Optimistic update: reflect the edit immediately, before the network
      // round trip resolves, so the UI never appears to "not save" even on a
      // slow connection. If the request fails, we roll back via refresh().
      if (payload.action === "update" && payload.id) {
        setState((prev) => patchState(prev, payload.type, payload.id!, payload.properties));
      }

      try {
        const res = await fetch("/api/mutate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Mutation failed");
        }
        // Reconcile with the source of truth (also picks up server-computed
        // values and the real id for newly created records).
        await refresh();
        return data as { id: string };
      } catch (err) {
        // Roll back the optimistic patch by re-syncing with the server.
        await refresh();
        throw err;
      }
    },
    [refresh]
  );

  return { state, loading, error, refresh, mutate };
}
