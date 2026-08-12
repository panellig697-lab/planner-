import { NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic endpoint — delete once the NOTION_API_KEY /
 * "API token is invalid (401)" issue is resolved.
 *
 * Never logs or returns the full key. Only enough (first 6 / last 4
 * characters, length, and whitespace checks) to tell whether the value
 * Vercel is actually injecting at runtime matches what's in Notion's
 * integration settings — catching a wrong value, a stale build that
 * didn't pick up the env var change, or a corrupted paste (stray
 * leading/trailing whitespace or an embedded line break).
 *
 * Also makes a live notion.users.me() call through the app's actual
 * getNotionClient() — the same client construction every real API route
 * uses — and reports Notion's raw rejection (status/code/message), so we
 * can see exactly what Notion says instead of guessing from a generic
 * "unauthorized" string further up the stack.
 */
export async function GET() {
  const raw = process.env.NOTION_API_KEY;

  const keyInfo = !raw
    ? { present: false as const }
    : (() => {
        const trimmed = raw.trim();
        return {
          present: true as const,
          length: raw.length,
          trimmedLength: trimmed.length,
          prefix: raw.slice(0, 6),
          suffix: raw.slice(-4),
          hasLeadingOrTrailingWhitespace: raw !== trimmed,
          containsNewline: /[\r\n]/.test(raw),
          containsWhitespaceAnywhere: /\s/.test(raw),
          // Notion internal integration secrets currently start with "ntn_"
          // (older keys start with "secret_"). A different prefix usually
          // means the wrong value was pasted.
          looksLikeNotionKeyPrefix: /^(ntn_|secret_)/.test(trimmed),
        };
      })();

  const base = {
    key: keyInfo,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  };

  if (!raw) {
    return NextResponse.json({
      ...base,
      liveCall: { attempted: false, reason: "NOTION_API_KEY is not set." },
    });
  }

  try {
    // Same singleton every real route (/api/state, /api/mutate) uses —
    // this exercises the exact client construction, not a fresh one.
    const notion = getNotionClient();
    const me = await notion.users.me({});
    return NextResponse.json({
      ...base,
      liveCall: {
        attempted: true,
        ok: true,
        botId: me.id,
        botName: "name" in me ? me.name ?? null : null,
        workspaceName:
          "bot" in me &&
          me.bot &&
          typeof me.bot === "object" &&
          "workspace_name" in me.bot
            ? (me.bot as { workspace_name?: string | null }).workspace_name ??
              null
            : null,
      },
    });
  } catch (err: unknown) {
    const e = err as {
      name?: string;
      code?: string;
      status?: number;
      message?: string;
    };
    return NextResponse.json({
      ...base,
      liveCall: {
        attempted: true,
        ok: false,
        // Notion's own SDK error shape: `code` is Notion's error code
        // (e.g. "unauthorized"), `status` is the HTTP status it got back,
        // `message` is Notion's own error text — this is Notion talking,
        // not our interpretation of it.
        errorName: e.name ?? null,
        notionErrorCode: e.code ?? null,
        httpStatus: e.status ?? null,
        notionMessage: e.message ?? String(err),
      },
    });
  }
}
