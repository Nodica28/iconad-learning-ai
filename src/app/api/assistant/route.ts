import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { instructions, name, model } = await req.json();

    const newAssistant = await openai.beta.assistants.create({
      instructions,
      name,
      model,
    });
    return NextResponse.json(newAssistant);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
