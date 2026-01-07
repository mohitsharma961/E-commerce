"use client";

import React, { useEffect, useRef, useState } from "react";
import { Product } from "@/types";
import ProductCard from "./ui/product-card";
import NoResults from "./ui/no-results";

interface SearchProductsProps {
  initialItems: Product[];
}

const SearchProducts: React.FC<SearchProductsProps> = ({ initialItems }) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Product[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If query is empty, show the initial items
    if (!query) {
      setItems(initialItems);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/products?description=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data: Product[] = await res.json();
        setItems(data);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        console.error("search error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query, initialItems]);

  return (
    <div className="space-y-4" id="featured">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-bold text-xl sm:text-3xl">Products</h3>

        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="border p-2 rounded w-56"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-sm underline text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Searching...</div>}

      {!loading && items.length === 0 && <NoResults />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
};

export default SearchProducts;
