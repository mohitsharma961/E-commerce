import { NextResponse } from "next/server";
import { products } from "@/lib/mock-data";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const isFeatured = url.searchParams.get("isFeatured");
    const categoryId = url.searchParams.get("categoryId");
    const colorId = url.searchParams.get("colorId");
    const sizeId = url.searchParams.get("sizeId");
    const description = url.searchParams.get("description");

    let result = products.slice();

    if (isFeatured === "true") {
      result = result.filter((p) => p.isFeatured);
    }

    if (categoryId) {
      result = result.filter((p) => p.category?.id === categoryId);
    }

    if (colorId) {
      result = result.filter((p) => p.color?.id === colorId);
    }

    if (sizeId) {
      result = result.filter((p) => p.size?.id === sizeId);
    }

    if (description) {
      const q = description.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
