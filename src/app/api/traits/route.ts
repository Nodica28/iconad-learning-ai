import { NextRequest, NextResponse } from "next/server";
import { saveTraits } from "@/lib/useProgress";

export async function POST(req: NextRequest) {
  try {
    const { email, traits } = await req.json();

    console.log("Saving child traits...");

    await saveTraits(email, traits);

    return NextResponse.json({ message: "Traits saved successfully" });
  } catch (error: any) {
    console.error("Error saving conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
