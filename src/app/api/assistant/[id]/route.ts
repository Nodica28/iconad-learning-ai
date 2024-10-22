import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function GET(req: NextRequest) {
  try {
    const assistantId = req.nextUrl.searchParams.get("id");
    if (!assistantId) {
      throw new Error("Assistant ID is required");
    }
    const myAssistant = await openai.beta.assistants.retrieve(assistantId);
    return NextResponse.json(myAssistant);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
