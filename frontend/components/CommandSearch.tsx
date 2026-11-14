"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PageResponse, ProductSummary } from "@/lib/types";
import Icon from "./Icon";
import LogoBadge from "./LogoBadge";

export default function CommandSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // global shortcut: ctrl/cmd + k
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // debounced live search
  useEffect(() => {
    const term = q.trim();
    if (!open || term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/bff/products?q=${encodeURIComponent(term)}&period=all&size=6`, { signal: controller.signal });
        if (res.ok) {
          const data = (await res.json()) as PageResponse<ProductSummary>;
          setResults(data.content);
          setActive(0);
        }
      } catch {
        /* aborted or offline: keep previous results */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, open]);

  function close() {
    setOpen(false);
    setQ("");
    setResults([]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = results[active];
      if (picked) router.push(`/products/${picked.slug}`);
      else if (q.trim()) router.push(`/launches?q=${encodeURIComponent(q.trim())}`);
      close();
    }
  }

  return (
    <>
      <button type="button" className="search-pill" onClick={() => setOpen(true)} aria-label="search products">
        <Icon name="search" size={16} />
        <span className="label">search products</span>
        <span className="kbd">ctrl k</span>
      </button>
      {open && (
        <div className="palette-backdrop" onMouseDown={close}>
          <div className="palette" role="dialog" aria-modal="true" aria-label="search products" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
            <div className="palette-input">
              <Icon name="search" size={18} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search by name or tagline"
                aria-label="search products"
                maxLength={80}
                style={{ boxShadow: "none" }}
              />
              <span className="kbd">esc</span>
            </div>
            <div className="palette-list" role="listbox">
              {q.trim().length < 2 && <p className="palette-empty">type at least two letters</p>}
              {q.trim().length >= 2 && loading && results.length === 0 && <p className="palette-empty">searching...</p>}
              {q.trim().length >= 2 && !loading && results.length === 0 && <p className="palette-empty">no products found for &quot;{q.trim()}&quot;</p>}
              {results.map((p, i) => (
                <Link key={p.id} href={`/products/${p.slug}`} onClick={close} className="palette-item" role="option" aria-selected={i === active}>
                  <LogoBadge name={p.name} logoUrl={p.logoUrl} size={36} />
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: "0.95rem" }}>{p.name}</b>
                    <span className="muted small">{p.tagline}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="palette-foot">
              <span>↑↓ to move</span>
              <span>enter to open</span>
              <span>esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
