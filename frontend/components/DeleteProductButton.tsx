"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`delete "${name}"? its votes and feedback will be removed too.`)) return;
    setBusy(true);
    const res = await fetch(`/bff/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={remove} disabled={busy} aria-label={`delete ${name}`}>
      <Icon name="trash" size={14} />
      delete
    </button>
  );
}
