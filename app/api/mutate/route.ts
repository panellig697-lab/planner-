import { NextResponse } from "next/server";
import { mutate } from "@/lib/mutate";
import { ENTITY_TYPES } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, action, id, properties } = body ?? {};

    if (!ENTITY_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
    }
    if (action !== "create" && action !== "update") {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }
    if (action === "update" && !id) {
      return NextResponse.json({ error: "id is required for update" }, { status: 400 });
    }

    const result = await mutate({ type, action, id, properties: properties ?? {} });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/mutate failed", err);
    return NextResponse.json(
      { error: err?.message ?? "Mutation failed" },
      { status: 500 }
    );
  }
}
