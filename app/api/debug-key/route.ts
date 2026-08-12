import { NextResponse } from "next/server";

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
 */
export async function GET() {
  const raw = process.env.NOTION_API_KEY;

  if (!raw) {
    return NextResponse.json({
      present: false,
      message: "NOTION_API_KEY is not set in this deployment's environment.",
    });
  }

  const trimmed = raw.trim();

  return NextResponse.json({
    present: true,
    length: raw.length,
    trimmedLength: trimmed.length,
    prefix: raw.slice(0, 6),
    suffix: raw.slice(-4),
    hasLeadingOrTrailingWhitespace: raw !== trimmed,
    containsNewline: /[\r\n]/.test(raw),
    containsWhitespaceAnywhere: /\s/.test(raw),
    // Notion internal integration secrets currently start with "ntn_"
    // (older keys start with "secret_"). A different prefix usually means
    // the wrong value was pasted.
    looksLikeNotionKeyPrefix: /^(ntn_|secret_)/.test(trimmed),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
