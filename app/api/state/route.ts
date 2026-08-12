import { NextResponse } from "next/server";
import { getState } from "@/lib/state";
import { formatApiError } from "@/lib/apiError";

// Belt and suspenders against stale data, at every layer between Notion and
// the browser:
// - dynamic/revalidate: tell Next.js this route is never statically
//   rendered or cached, so it re-executes on every request.
// - lib/notion.ts's noStoreFetch forces cache: "no-store" on the actual
//   fetch calls the Notion SDK makes, explicitly, rather than relying on
//   the above propagating down into a third-party SDK's own fetch default.
// - the Cache-Control header below covers the response Vercel's edge/CDN
//   actually serves, independent of Next's internal rendering mode.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function GET() {
  try {
    const state = await getState();
    return NextResponse.json(state, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("GET /api/state failed", err);
    return NextResponse.json(
      { error: formatApiError(err) },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
