"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Currency from "@/components/ui/currency";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [oRes, pRes] = await Promise.all([axios.get(`/api/orders`), axios.get(`/api/products`)]);
      // sort orders by createdAt desc
      const os = (oRes.data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(os);
      setProducts(pRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get("created")) {
      toast.success("Order created successfully.");
    }
  }, [searchParams]);

  const findName = (id: string) => products.find((p) => p.id === id)?.name || id;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-neutral-500">{isLoading ? 'Loading...' : `${orders.length} orders`}</div>
          <button onClick={fetchData} className="text-sm px-3 py-1 bg-gray-100 rounded">Refresh</button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 text-neutral-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded">
              <div className="flex justify-between">
                <div className="font-medium">Order {order.id}</div>
                <div className="text-neutral-500 text-sm">{new Date(order.createdAt).toLocaleString()}</div>
              </div>

              <div className="mt-2 text-sm">
                {order.productIds.map((pid: string) => (
                  <div key={pid} className="flex justify-between">
                    <div>{findName(pid)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="font-medium">Total</div>
                <Currency value={order.total} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
