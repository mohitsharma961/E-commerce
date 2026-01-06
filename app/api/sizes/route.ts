import { NextResponse } from "next/server";
import { sizes } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(sizes);
}
