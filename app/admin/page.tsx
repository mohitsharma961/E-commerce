"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Currency from "@/components/ui/currency";
import { toast } from "react-hot-toast";

const AdminPage = () => {
  const [token, setToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '');
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      fetchAll();
    }
  }, [token]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const headers = { 'x-admin-token': token };
      const [aRes, oRes] = await Promise.all([
        axios.get('/api/admin/analytics', { headers }),
        axios.get('/api/admin/orders', { headers }),
      ]);
      setAnalytics(aRes.data);
      setOrders(oRes.data || []);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
      const msg = err?.response?.data?.error || err?.message || 'Failed to load admin data';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setAnalytics(null);
    setOrders([]);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {token ? <button onClick={logout} className="text-sm px-3 py-1 bg-gray-100 rounded">Logout</button> : null}
      </div>

      {!token ? (
        <div className="mt-6 max-w-sm">
          <p className="mb-2 text-sm text-neutral-500">Enter admin token to view analytics (set ADMIN_TOKEN in server env).</p>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="admin token" className="w-full p-2 border rounded" />
          <div className="mt-3 flex gap-2">
            <button onClick={fetchAll} className="px-3 py-2 bg-black text-white rounded">Login & Refresh</button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-neutral-500">Total Orders</div>
              <div className="text-2xl font-bold">{analytics?.totalOrders ?? '—'}</div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-neutral-500">Total Revenue</div>
              <div className="text-2xl font-bold"><Currency value={analytics?.totalRevenue ?? 0} /></div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="text-sm text-neutral-500">Avg Order</div>
              <div className="text-2xl font-bold"><Currency value={analytics?.avgOrderValue ?? 0} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-2">Orders (last 7 days)</h3>
              <div className="space-y-1 text-sm text-neutral-700">
                {analytics?.ordersLast7Days?.map((d: any) => (
                  <div key={d.date} className="flex justify-between">
                    <div>{d.date}</div>
                    <div>{d.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-2">Top products</h3>
              <div className="space-y-1 text-sm text-neutral-700">
                {analytics?.topProducts?.map((p: any) => (
                  <div key={p.id} className="flex justify-between">
                    <div>{p.name}</div>
                    <div>{p.count} • <Currency value={p.revenue} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Recent orders</h3>
              <button onClick={fetchAll} className="text-sm px-3 py-1 bg-gray-100 rounded">Refresh</button>
            </div>

            {orders.length === 0 ? (
              <p className="text-neutral-500">No orders yet.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {orders.slice(0, 20).map((o: any) => (
                  <div key={o.id} className="border p-3 rounded">
                    <div className="flex justify-between">
                      <div className="font-medium">{o.id}</div>
                      <div className="text-neutral-500 text-sm">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm">
                      {o.productIds.join(", ")} 
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-medium">Total</div>
                      <Currency value={o.total} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
