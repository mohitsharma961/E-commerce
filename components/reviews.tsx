"use client";

import React, { useEffect, useState } from "react";
import { Review } from "@/types";
import { Star } from "lucide-react";

interface Props {
  productId: string;
}

const StarsDisplay: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center">
      {stars.map((s) => (
        <Star key={s} className={`text-yellow-400 ${s <= Math.round(rating) ? "opacity-100" : "opacity-30"}`} size={size} />
      ))}
    </div>
  );
};

const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="focus:outline-none"
          aria-label={`Rate ${s} star`}
        >
          <Star size={20} className={`text-yellow-400 ${s <= value ? "opacity-100" : "opacity-30"}`} />
        </button>
      ))}
    </div>
  );
};

const Reviews: React.FC<Props> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to load");
      const data: Review[] = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // realtime-like: poll every 10s to pick up new reviews from other users/devs
    const id = setInterval(fetchReviews, 10000);
    return () => clearInterval(id);
  }, [productId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !productId) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment, name }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      const newReview: Review = await res.json();
      // real-time update: prepend
      setReviews((prev) => [newReview, ...prev]);
      setName("");
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8">
      <h3 className="text-xl font-semibold mb-3">Customer reviews</h3>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">{avg ? avg.toFixed(1) : "—"}</div>
          <StarsDisplay rating={avg} />
          <div className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mb-6">
        <div className="mb-2">
          <label className="text-sm">Your rating</label>
          <div>
            <StarInput value={rating} onChange={setRating} />
          </div>
        </div>
        <div className="mb-2">
          <label className="text-sm">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div className="mb-2">
          <label className="text-sm">Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border p-2 rounded" rows={3} />
        </div>
        <div>
          <button type="submit" disabled={submitting} className="bg-black text-white px-4 py-2 rounded">
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </form>

      <div>
        {loading && <div className="text-sm text-gray-500">Loading reviews...</div>}
        {!loading && reviews.length === 0 && <div className="text-sm text-gray-500">No reviews yet — be the first!</div>}
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{r.name || "Anonymous"}</div>
                  <StarsDisplay rating={r.rating} size={14} />
                </div>
                <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              {r.comment && <div className="mt-2 text-sm">{r.comment}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;