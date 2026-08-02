import { NextResponse } from "next/server";
import { getState } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getState();
    return NextResponse.json(state);
  } catch (err: any) {
    console.error("GET /api/state failed", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load state" },
      { status: 500 }
    );
  }
}
