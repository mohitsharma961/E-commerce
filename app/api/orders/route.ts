import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { products } from "@/lib/mock-data";

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");
const SESSIONS_FILE = path.join(process.cwd(), "data", "checkout-sessions.json");

async function readJson(file: string) {
  try {
    const raw = await fs.promises.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeJson(file: string, data: any[]) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await fs.promises.writeFile(file, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    console.log('/api/orders GET received');
    const orders = await readJson(ORDERS_FILE);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("/api/orders GET error:", err);
    const message = err?.message || "Could not read orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('/api/orders POST received body:', body);
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const sessions = await readJson(SESSIONS_FILE);
    const session = sessions.find((s: any) => s.id === sessionId);

    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    // compute total
    const items = products.filter((p) => session.productIds.includes(p.id));
    const total = items.reduce((t, i) => t + Number(i.price), 0);

    const order = {
      id: `o_${Date.now()}`,
      productIds: session.productIds,
      total,
      createdAt: new Date().toISOString(),
    };

    const orders = await readJson(ORDERS_FILE);
    orders.push(order);
    await writeJson(ORDERS_FILE, orders);

    console.log('/api/orders created order:', order.id);

    // Optionally remove session
    const remaining = sessions.filter((s: any) => s.id !== sessionId);
    await writeJson(SESSIONS_FILE, remaining);

    const origin = new URL(req.url).origin;
    return NextResponse.json({ url: `${origin}/orders?created=true`, order });
  } catch (err: any) {
    console.error("/api/orders POST error:", err);
    const message = err?.message || "Could not create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}