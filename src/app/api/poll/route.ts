import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { thread_id, assistant_id } = await req.json();

    const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
      assistant_id: assistant_id,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      return NextResponse.json(messages);
    } else {
      return NextResponse.json({ status: run.status }, { status: 202 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
