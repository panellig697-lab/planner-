import { NextResponse } from "next/server";
import { getState } from "@/lib/state";
import { formatApiError } from "@/lib/apiError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getState();
    return NextResponse.json(state);
  } catch (err) {
    console.error("GET /api/state failed", err);
    return NextResponse.json({ error: formatApiError(err) }, { status: 500 });
  }
}
