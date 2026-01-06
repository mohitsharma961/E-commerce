import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { products } from "@/lib/mock-data";

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
    console.log("/api/admin/analytics GET received");
    const auth = requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const orders = await readJson(ORDERS_FILE);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // orders per day for last 7 days
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = orders.filter((o: any) => o.createdAt && o.createdAt.slice(0, 10) === key).length;
      days.push({ date: key, count });
    }

    // top products
    const counts: Record<string, number> = {};
    const revenues: Record<string, number> = {};
    for (const o of orders) {
      for (const pid of o.productIds) {
        counts[pid] = (counts[pid] || 0) + 1;
        const prod = products.find((p) => p.id === pid);
        revenues[pid] = (revenues[pid] || 0) + (prod ? Number(prod.price) : 0);
      }
    }

    const topProducts = Object.keys(counts)
      .map((id) => ({ id, count: counts[id], revenue: revenues[id] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((tp) => ({ ...tp, name: products.find((p) => p.id === tp.id)?.name || tp.id }));

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersLast7Days: days,
      topProducts,
    });
  } catch (err: any) {
    console.error("/api/admin/analytics error:", err);
    const message = err?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
