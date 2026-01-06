"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import { toast } from "react-hot-toast";

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const [session, setSession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/checkout?sessionId=${sessionId}`);
        setSession(res.data);

        // fetch products and filter
        const pr = await axios.get(`/api/products`);
        const products = pr.data.filter((p: any) => res.data.productIds.includes(p.id));
        setItems(products);
      } catch (err: any) {
        console.error("Fetch session error:", err);
        const msg = err?.response?.data?.error || err?.message || "Failed to load session.";
        toast.error(msg);
      }
    };

    fetchSession();
  }, [sessionId]);

  const total = items.reduce((t, i) => t + Number(i.price), 0);

  const onPay = async () => {
    try {
      setIsPaying(true);
      const res = await axios.post(`/api/orders`, { sessionId });

      if (res.data?.url) {
        router.push(res.data.url);
      } else {
        toast.success("Payment successful");
        router.push("/orders");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      const msg = err?.response?.data?.error || err?.message || "Payment failed";
      toast.error(msg);
    } finally {
      setIsPaying(false);
    }
  };

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="mt-4">Loading payment session…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Fake Payment</h1>
      <p className="text-sm text-neutral-500 mt-2">Session: {session.id}</p>

      <div className="mt-6">
        <h2 className="font-semibold">Order summary</h2>
        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between">
              <div>{it.name}</div>
              <div className="font-medium">${it.price}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
          <div className="text-base font-medium">Total</div>
          <Currency value={total} />
        </div>

        <div className="mt-6">
          <Button onClick={onPay} disabled={isPaying} className="w-full">
            {isPaying ? "Processing…" : "Pay"}
          </Button>
        </div>

        <p className="text-sm text-neutral-500 mt-3">This is a fake payment page for demo purposes.</p>
      </div>
    </div>
  );
};

export default PaymentPage;
