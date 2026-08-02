import { NextResponse } from "next/server";
import { getState } from "@/lib/state";
import { mutate } from "@/lib/mutate";
import { classify } from "@/lib/classify";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const state = await getState();
    const decision = await classify(text, state);
    await mutate({
      type: decision.type,
      action: decision.action,
      id: decision.id,
      properties: decision.properties,
    });

    return NextResponse.json({ summary: decision.summary });
  } catch (err: any) {
    console.error("POST /api/classify failed", err);
    return NextResponse.json(
      { error: err?.message ?? "Classification failed" },
      { status: 500 }
    );
  }
}
