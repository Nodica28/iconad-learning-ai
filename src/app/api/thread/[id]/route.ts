import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { saveConversation } from "@/lib/saveMessage";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const threadId = pathname.split("/").pop();

    const { role, content } = await req.json();

    if (!threadId) {
      throw new Error("Thread ID is required");
    }

    console.log("Saving user message...");
    const message = {
      role,
      content,
    };

    await saveConversation(threadId, message);

    const threadMessages = await openai.beta.threads.messages.create(
      threadId,
      message
    );

    return NextResponse.json(threadMessages);
  } catch (error: any) {
    console.error("Error saving conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
