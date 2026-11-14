"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readProblem } from "@/lib/client";
import type { Category, ProductDetail } from "@/lib/types";
import Icon from "./Icon";
import LogoBadge from "./LogoBadge";

export interface EditableProduct {
  id: number;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  categoryId: number;
}

export default function SubmitForm({ categories, product }: { categories: Category[]; product?: EditableProduct }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    websiteUrl: product?.websiteUrl ?? "https://",
    logoUrl: product?.logoUrl ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const res = await fetch(product ? `/bff/products/${product.id}` : "/bff/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, categoryId: Number(form.categoryId) }),
    });
    if (res.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!res.ok) {
      const problem = await readProblem(res);
      setError(problem.message);
      setFieldErrors(problem.fieldErrors);
      setBusy(false);
      return;
    }
    const data = (await res.json()) as ProductDetail;
    router.push(`/products/${data.product.slug}`);
    router.refresh();
  }

  const err = (k: string) => (fieldErrors[k] ? <span className="err">{fieldErrors[k]}</span> : null);
  const categoryName = categories.find((c) => c.id === Number(form.categoryId))?.name.toLowerCase() ?? "category";
  const host = (() => {
    try {
      return new URL(form.websiteUrl).host;
    } catch {
      return "yourproduct.com";
    }
  })();

  return (
    <div className="container" style={{ paddingBlock: "2.5rem" }}>
      <div className="page-head" style={{ paddingTop: 0 }}>
        <h1 className="h1">{product ? "edit your product" : "launch your product"}</h1>
        <p>free forever. you are ranked by real usage, and nobody can pay to rank higher.</p>
      </div>
      <div className="layout-2">
        <form onSubmit={submit} className="card card-pad stack-lg" noValidate>
          <div className="stack">
            <div className="field">
              <label htmlFor="name">name</label>
              <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} required placeholder="what is it called" aria-invalid={Boolean(fieldErrors.name)} />
              {err("name")}
            </div>
            <div className="field">
              <label htmlFor="tagline">tagline <span className="hint">(10 to 140 characters)</span></label>
              <input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={140} required placeholder="what does it do, in one sentence" aria-invalid={Boolean(fieldErrors.tagline)} />
              <span className="counter">{form.tagline.length} / 140</span>
              {err("tagline")}
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="url">website <span className="hint">(public https url)</span></label>
                <input id="url" type="url" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} maxLength={500} required aria-invalid={Boolean(fieldErrors.websiteUrl)} />
                {err("websiteUrl")}
              </div>
              <div className="field">
                <label htmlFor="cat">category</label>
                <select id="cat" value={form.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.toLowerCase()}
                    </option>
                  ))}
                </select>
                {err("categoryId")}
              </div>
            </div>
            <div className="field">
              <label htmlFor="logo">logo url <span className="hint">(optional, https)</span></label>
              <input id="logo" type="url" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} maxLength={500} placeholder="https://" aria-invalid={Boolean(fieldErrors.logoUrl)} />
              {err("logoUrl")}
            </div>
            <div className="field">
              <label htmlFor="desc">description <span className="hint">(optional)</span></label>
              <textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} rows={6} maxLength={4000} placeholder="who is it for, what problem does it solve, what makes it different" />
              <span className="counter">{form.description.length} / 4000</span>
              {err("description")}
            </div>
          </div>
          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}
          <div className="row">
            <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
              {busy ? "saving..." : product ? "save changes" : "launch now"}
              {!busy && <Icon name="arrow-right" size={16} />}
            </button>
            <span className="muted small">you can edit or delete it any time.</span>
          </div>
        </form>

        <aside className="rail" aria-label="live preview">
          <div>
            <p className="xs muted" style={{ marginBottom: 8, fontWeight: 600 }}>live preview</p>
            <div className="card card-pad stack">
              <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                <LogoBadge name={form.name || "p"} logoUrl={form.logoUrl.startsWith("https://") ? form.logoUrl : null} size={52} />
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontSize: "1.05rem" }}>{form.name || "your product name"}</b>
                  <p className="muted small">{form.tagline || "your tagline appears here"}</p>
                </div>
              </div>
              <div className="meta">
                <span className="tag">{categoryName}</span>
                <span className="m"><Icon name="globe" size={14} /> {host}</span>
              </div>
            </div>
          </div>
          <div className="card-soft card-pad">
            <p style={{ fontWeight: 650 }}>what happens next</p>
            <ul className="stack-sm small muted" style={{ marginTop: 10 }}>
              <li>your page goes live instantly and appears on today&apos;s board.</li>
              <li>people try your product and leave verified feedback.</li>
              <li>your proof score and backlink are earned from that proof.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
