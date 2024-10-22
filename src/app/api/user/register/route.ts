import { register } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    await register(email);
    return NextResponse.json({ message: "Registration successful" });
  } catch (error: any) {
    let status = 500;
    if (error.message === "User already exists") {
      status = 400;
    }
    return NextResponse.json({ error: error.message }, { status });
  }
}
