import { NextRequest, NextResponse } from "next/server";
import { executeAgentLoop } from "@/lib/agentTools";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, existingInstanceNames = [] } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const result = await executeAgentLoop(prompt, existingInstanceNames);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message: "", nodes: [], edges: [], error: message }, { status: 500 });
  }
}
