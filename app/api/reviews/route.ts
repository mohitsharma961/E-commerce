import { NextResponse } from "next/server";
import { reviews } from "@/lib/mock-data";
import { Review } from "@/types";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");

    let result = reviews.slice();

    if (productId) {
      result = result.filter((r: any) => r.productId === productId);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("/api/reviews GET error:", err);
    return NextResponse.json({ error: "Could not fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, rating, comment, name } = body;

    if (!productId || !rating) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newReview: Review = {
      id: `r_${Date.now()}`,
      productId,
      rating: Number(rating),
      comment: comment || "",
      name: name || "Anonymous",
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview as any);

    return NextResponse.json(newReview, { status: 201 });
  } catch (err: any) {
    console.error("/api/reviews POST error:", err);
    return NextResponse.json({ error: "Could not add review" }, { status: 500 });
  }
}