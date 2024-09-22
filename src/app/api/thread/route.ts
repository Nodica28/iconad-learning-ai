import { NextResponse, NextRequest } from "next/server";
import openai from "@/lib/openai";

export async function POST() {
  try {
    const messageThread = await openai.beta.threads.create();
    return NextResponse.json(messageThread);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const threadId = req.nextUrl.searchParams.get("id");

    if (!threadId) {
      throw new Error("Thread ID is required");
    }

    const threadMessages = await openai.beta.threads.messages.list(threadId);
    return NextResponse.json(threadMessages.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
