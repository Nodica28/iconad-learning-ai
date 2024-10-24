import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { saveConversation } from "@/lib/saveMessage";

export async function POST(req: NextRequest) {
  try {
    const { thread_id, assistant_id, email } = await req.json();

    const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
      assistant_id: assistant_id,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);

      if (
        messages.data &&
        messages.data[0] &&
        "text" in messages.data[0].content[0]
      ) {
        console.log("Saving assistant message...");
        await saveConversation(
          thread_id,
          {
            content: messages.data[0].content[0].text.value,
            role: "assistant",
          },
          email
        );
      }

      return NextResponse.json(messages);
    } else {
      return NextResponse.json({ status: run.status }, { status: 202 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
