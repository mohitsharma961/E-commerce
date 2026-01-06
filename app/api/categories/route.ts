import { NextResponse } from "next/server";
import { categories } from "@/lib/mock-data";

export async function GET() {
  try {
    return NextResponse.json(categories);
  } catch (err: any) {
    console.error("/api/categories GET error:", err);
    return NextResponse.json({ error: "Could not fetch categories" }, { status: 500 });
  }
}
