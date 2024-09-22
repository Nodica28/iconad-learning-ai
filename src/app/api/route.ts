import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Test");

    return NextResponse.json(
      { status: "ok", message: "It works! =)" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
