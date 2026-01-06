import { NextResponse } from "next/server";
import { products } from "@/lib/mock-data";
import fs from "fs";
import path from "path";

const SESSIONS_FILE = path.join(process.cwd(), "data", "checkout-sessions.json");

async function readSessions() {
  try {
    const raw = await fs.promises.readFile(SESSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeSessions(data: any[]) {
  await fs.promises.mkdir(path.dirname(SESSIONS_FILE), { recursive: true });
  await fs.promises.writeFile(SESSIONS_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    console.log('/api/checkout POST received');
    const body = await req.json();
    console.log('/api/checkout POST body:', body);
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    // validate product ids
    const validIds = products.map((p) => p.id);
    const unknown = productIds.find((id: string) => !validIds.includes(id));

    if (unknown) {
      return NextResponse.json({ error: "Invalid product id provided" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;

    // create a simple session
    const id = `s_${Date.now()}`;
    const session = { id, productIds, createdAt: new Date().toISOString() };

    const sessions = await readSessions();
    sessions.push(session);
    await writeSessions(sessions);

    const url = `${origin}/payment?sessionId=${id}`;

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("/api/checkout POST error:", err);
    const message = err?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    console.log('/api/checkout GET received', req.url);
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const sessions = await readSessions();
    const session = sessions.find((s: any) => s.id === sessionId);

    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err: any) {
    console.error("/api/checkout GET error:", err);
    const message = err?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
