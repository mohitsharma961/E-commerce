import { NextResponse } from "next/server";
import { colors } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(colors);
}
