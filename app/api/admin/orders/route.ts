import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

async function readJson(file: string) {
  try {
    const raw = await fs.promises.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function requireAdmin(req: Request) {
  const token = req.headers.get("x-admin-token");
  if (!process.env.ADMIN_TOKEN) {
    console.warn("ADMIN_TOKEN not set on server");
    return { ok: false, message: "Server not configured for admin access" };
  }
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return { ok: false, message: "Unauthorized" };
  }
  return { ok: true };
}

export async function GET(req: Request) {
  try {
    console.log("/api/admin/orders GET received");
    const auth = requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const orders = await readJson(ORDERS_FILE);
    // newest first
    const sorted = (orders || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(sorted);
  } catch (err: any) {
    console.error("/api/admin/orders error:", err);
    const message = err?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
