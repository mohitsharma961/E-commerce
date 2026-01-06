import { NextResponse } from "next/server";
import { categories } from "@/lib/mock-data";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const category = categories.find((c) => c.id === id);

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}
