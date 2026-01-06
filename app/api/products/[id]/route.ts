import { NextResponse } from "next/server";
import { products } from "@/lib/mock-data";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const product = products.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
