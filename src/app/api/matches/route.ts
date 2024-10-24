import { NextRequest, NextResponse } from "next/server";
import { saveMatches } from "@/lib/useProgress";

export async function POST(req: NextRequest) {
  try {
    const { email, matches } = await req.json();

    console.log("Saving matches...");

    await saveMatches(email, matches);

    return NextResponse.json({ message: "Matches saved successfully" });
  } catch (error: any) {
    console.error("Error matches conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
