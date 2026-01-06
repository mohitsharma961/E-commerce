"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Currency from "@/components/ui/currency";
import { toast } from "react-hot-toast";

const BarChart: React.FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  const width = 300;
  const height = 100;
  const padding = 8;
  const barWidth = (width - padding * 2) / data.length;

  return (
    <svg width={width} height={height} className="block">
      {data.map((d, i) => {
        const h = (d.count / max) * (height - padding * 2);
        const x = padding + i * barWidth;
        const y = height - padding - h;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barWidth - 6} height={h} fill="#111827" />
            <text x={x + (barWidth - 6) / 2} y={height - 2} fontSize={10} textAnchor="middle" fill="#6b7280">
              {d.date.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const AdminOrdersPage = () => {
  const [token, setToken] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("adminToken") || "" : ""));
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const headers = { "x-admin-token": token };
      const [aRes, oRes] = await Promise.all([axios.get("/api/admin/analytics", { headers }), axios.get("/api/admin/orders", { headers })]);
      setAnalytics(aRes.data);
      setOrders(oRes.data || []);
    } catch (err: any) {
      console.error("Admin orders fetch error:", err);
      const msg = err?.response?.data?.error || err?.message || "Failed to load";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    setAnalytics(null);
    setOrders([]);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin — Orders</h1>
        {token ? <button onClick={logout} className="text-sm px-3 py-1 bg-gray-100 rounded">Logout</button> : null}
      </div>

      {!token ? (
        <div className="mt-6 max-w-sm">
          <p className="mb-2 text-sm text-neutral-500">Enter admin token to view orders.</p>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="admin token" className="w-full p-2 border rounded" />
          <div className="mt-3 flex gap-2">
            <button onClick={fetchAll} className="px-3 py-2 bg-black text-white rounded">Login & Refresh</button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="p-4 bg-white rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500">Orders (last 7 days)</div>
                {analytics?.ordersLast7Days ? <BarChart data={analytics.ordersLast7Days} /> : <div className="text-sm text-neutral-500">No data</div>}
              </div>
              <div>
                <div className="text-sm text-neutral-500">Total orders</div>
                <div className="text-xl font-bold">{analytics?.totalOrders ?? "—"}</div>
                <div className="text-sm text-neutral-500 mt-1">Total revenue: <Currency value={analytics?.totalRevenue ?? 0} /></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">All orders</h3>
              <button onClick={fetchAll} className="text-sm px-3 py-1 bg-gray-100 rounded">Refresh</button>
            </div>

            {isLoading ? (
              <p className="text-neutral-500">Loading orders…</p>
            ) : orders.length === 0 ? (
              <p className="text-neutral-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Items</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="p-2">{o.id}</td>
                        <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="p-2">{o.productIds.join(", ")}</td>
                        <td className="p-2"><Currency value={o.total} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
