import { NextRequest, NextResponse } from "next/server";
import { saveProgress } from "@/lib/useProgress";

export async function POST(req: NextRequest) {
  try {
    const { email, progress } = await req.json();

    console.log("Saving last progress...");

    await saveProgress(email, progress);

    return NextResponse.json({ message: "Progress saved successfully" });
  } catch (error: any) {
    console.error("Error saving conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
