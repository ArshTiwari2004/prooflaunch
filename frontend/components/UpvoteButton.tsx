"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readProblem } from "@/lib/client";
import type { EngagementResult } from "@/lib/types";
import Icon from "./Icon";

interface Props {
  productId: number;
  initialCount: number;
  initialUpvoted: boolean;
}

export default function UpvoteButton({ productId, initialCount, initialUpvoted }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/products/${productId}/upvote`, { method: upvoted ? "DELETE" : "PUT" });
      if (res.status === 401) {
        const here = window.location.pathname + window.location.search;
        router.push(`/login?next=${encodeURIComponent(here)}`);
        return;
      }
      if (!res.ok) {
        setError((await readProblem(res)).message);
        return;
      }
      const data = (await res.json()) as EngagementResult;
      setCount(data.upvoteCount);
      setUpvoted(data.upvoted);
    } catch {
      setError("network error, try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="upvote-wrap">
      <button
        type="button"
        className={`upvote ${upvoted ? "on" : ""}`}
        onClick={toggle}
        disabled={busy}
        aria-pressed={upvoted}
        aria-label={upvoted ? "remove your upvote" : "upvote this product"}
      >
        <Icon name="arrow-up" size={16} strokeWidth={2.4} />
        <span>{count}</span>
      </button>
      {error && (
        <p className="err xs" role="alert" style={{ maxWidth: 120, marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
