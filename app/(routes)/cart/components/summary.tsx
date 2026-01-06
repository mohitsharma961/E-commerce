"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { toast } from "react-hot-toast";

const Summary = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const items = useCart((state) => state.items);
  const removeAll = useCart((state) => state.removeAll);

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment completed.");
      removeAll();
    }

    if (searchParams.get("canceled")) {
      toast.error("Something went wrong.");
    }
  }, [searchParams, removeAll]);

  const totalPrice = items.reduce((total, item) => {
    return total + Number(item.price);
  }, 0);

  const [isLoading, setIsLoading] = useState(false);

  const onCheckout = async () => {
    try {
      setIsLoading(true);

      const url = '/api/checkout';
      console.log('Checkout POST url:', url);

      const response = await axios.post(url, {
        productIds: items.map((item) => item.id),
      });

      console.log('Checkout response status:', response.status, 'data:', response.data);

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else if (response.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.error("Checkout failed.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      const msg = err?.response?.data?.error || err?.message || "Checkout request failed.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-medium text-gray-900">Order total</div>
          <Currency value={totalPrice} />
        </div>
      </div>
      <Button
        onClick={onCheckout}
        disabled={items.length === 0 || isLoading}
        className="w-full mt-6"
      >
        {isLoading ? "Processing..." : "Checkout"}
      </Button>

      <Button
        onClick={() => router.push('/orders')}
        className="w-full mt-2 bg-white text-black"
      >
        View orders
      </Button>
    </div>
  );
};

export default Summary;
