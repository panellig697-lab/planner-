"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_STATE, type AppState } from "./types";
import type { EntityType } from "./schema";

/** How often to silently re-poll /api/state in the background. */
const BACKGROUND_REFRESH_INTERVAL_MS = 30_000;

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

/**
 * fetch() has no default timeout — if the server hangs (a slow upstream
 * Notion call, a serverless function that gets killed mid-request), the
 * browser will happily wait forever and the UI is stuck on "Saving…" with
 * no way to tell the difference between "still working" and "dead". This
 * guarantees every request reaches a terminal state within `timeoutMs`.
 */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(
        `Request timed out after ${Math.round(timeoutMs / 1000)}s — the server didn't respond. Check your connection and try again.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards so background polling never fights a foreground refresh/mutate
  // for the same request slot, and so a slow poll can't overlap the next one.
  const mutatingRef = useRef(false);
  const backgroundRefreshInFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout("/api/state", { cache: "no-store" }, 15_000);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load state");
      setState(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load state");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Same fetch as refresh(), but silent: no loading flag, no error banner,
   * no flicker. Used for the 30s background poll and the tab-refocus
   * refetch — the user shouldn't see anything happen unless the data
   * actually changed. A failure here just means we try again on the next
   * poll/focus; it never surfaces as an error state, since a transient
   * network blip on a background check-in isn't worth interrupting the
   * user over.
   */
  const silentRefresh = useCallback(async () => {
    if (mutatingRef.current || backgroundRefreshInFlightRef.current) return;
    backgroundRefreshInFlightRef.current = true;
    try {
      const res = await fetchWithTimeout("/api/state", { cache: "no-store" }, 15_000);
      if (!res.ok) return;
      const data = await res.json();
      setState(data);
    } catch {
      // Swallow — see doc comment above.
    } finally {
      backgroundRefreshInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll every 30s in the background.
  useEffect(() => {
    const interval = setInterval(silentRefresh, BACKGROUND_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [silentRefresh]);

  // Refetch immediately whenever the tab regains focus (e.g. the user
  // switched back after being away long enough for Notion data to change).
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        silentRefresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [silentRefresh]);

  const mutate = useCallback(
    async (payload: MutatePayload) => {
      mutatingRef.current = true;
      // Optimistic update: reflect the edit immediately, before the network
      // round trip resolves, so the UI never appears to "not save" even on a
      // slow connection. If the request fails, we roll back via refresh().
      if (payload.action === "update" && payload.id) {
        setState((prev) => patchState(prev, payload.type, payload.id!, payload.properties));
      }

      try {
        const res = await fetchWithTimeout(
          "/api/mutate",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          },
          30_000
        );
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
      } finally {
        mutatingRef.current = false;
      }
    },
    [refresh]
  );

  return { state, loading, error, refresh, mutate };
}
