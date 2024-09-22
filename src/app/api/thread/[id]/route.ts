import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const threadId = req.nextUrl.searchParams.get("id");
    const { messages } = await req.json();

    if (!threadId) {
      throw new Error("Thread ID is required");
    }

    const threadMessages = await openai.beta.threads.messages.create(
      threadId,
      messages
    );
    return NextResponse.json(threadMessages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
