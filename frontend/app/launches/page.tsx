import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import ProductCard from "@/components/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Category, PageResponse, ProductSummary } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "launches",
  description: "every launch, ranked by verified tries. filter by day, week, month or category.",
};

const PERIODS = [
  { key: "today", label: "today" },
  { key: "week", label: "this week" },
  { key: "month", label: "this month" },
  { key: "all", label: "all time" },
] as const;

type SearchParams = { period?: string; category?: string; q?: string; page?: string };

function href(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/launches?${s}` : "/launches";
}

export default async function Launches({ searchParams }: { searchParams: SearchParams }) {
  const period = PERIODS.some((p) => p.key === searchParams.period) ? (searchParams.period as string) : "week";
  const page = Math.max(0, Number.parseInt(searchParams.page ?? "0", 10) || 0);
  const category = searchParams.category?.trim() || undefined;
  const q = searchParams.q?.trim() || undefined;

  const query = new URLSearchParams({ period, size: "20", page: String(page) });
  if (category) query.set("category", category);
  if (q) query.set("q", q);

  const [data, categories] = await Promise.all([
    apiFetch<PageResponse<ProductSummary>>(`/products?${query.toString()}`),
    apiFetch<Category[]>("/categories", { auth: false }),
  ]);
  const base = { period, category, q };
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="container">
      <div className="page-head">
        <h1 className="h1">launches</h1>
        <p>every product here is ranked by verified tries. try a few, leave honest feedback, and help the best ones rise.</p>
      </div>

      <div className="layout-2">
        <div>
          <div className="toolbar">
            <nav className="segmented" aria-label="time period">
              {PERIODS.map((p) => (
                <Link key={p.key} href={href({ ...base, period: p.key, page: undefined })} className={p.key === period ? "active" : ""} aria-current={p.key === period ? "page" : undefined}>
                  {p.label}
                </Link>
              ))}
            </nav>
            <form className="search-form" action="/launches" role="search">
              <input type="hidden" name="period" value={period} />
              {category && <input type="hidden" name="category" value={category} />}
              <label className="sr-only" htmlFor="q">search products</label>
              <input id="q" name="q" defaultValue={q} placeholder="filter by name" maxLength={80} />
              <button className="btn btn-secondary" type="submit" aria-label="search"><Icon name="search" size={16} /></button>
            </form>
          </div>

          <div className="chips" role="group" aria-label="categories">
            <Link href={href({ ...base, category: undefined, page: undefined })} className={`chip ${!category ? "active" : ""}`}>all</Link>
            {categories.map((c) => (
              <Link key={c.id} href={href({ ...base, category: c.slug, page: undefined })} className={`chip ${category === c.slug ? "active" : ""}`}>
                {c.name.toLowerCase()}
              </Link>
            ))}
          </div>

          {data.content.length === 0 ? (
            <div className="card empty">
              <h2 className="h3">no launches here yet</h2>
              <p>
                {q || activeCategory ? "try clearing a filter, or " : ""}be the first to launch in this window.
              </p>
              <Link href="/submit" className="btn btn-primary">launch a product</Link>
            </div>
          ) : (
            <ol className="list">
              {data.content.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={page * data.size + i + 1} />
              ))}
            </ol>
          )}

          {data.totalPages > 1 && (
            <nav className="pager" aria-label="pagination">
              {page > 0 ? <Link className="btn btn-secondary btn-sm" href={href({ ...base, page: String(page - 1) })}>previous</Link> : <span />}
              <span className="muted small">page {page + 1} of {data.totalPages}</span>
              {page + 1 < data.totalPages ? <Link className="btn btn-secondary btn-sm" href={href({ ...base, page: String(page + 1) })}>next</Link> : <span />}
            </nav>
          )}
        </div>

        <aside className="rail" aria-label="sidebar">
          <div className="card card-pad stack-sm">
            <span className="tag tag-brand"><Icon name="shield" size={13} /> how ranking works</span>
            <p style={{ fontWeight: 650, marginTop: 8 }}>proof score</p>
            <p className="muted small">upvote points plus 4 times verified try points. new accounts count 25 percent.</p>
            <Link href="/how-scoring-works" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>read the full formula</Link>
          </div>
          <div className="card card-pad stack-sm">
            <p style={{ fontWeight: 650 }}>building something?</p>
            <p className="muted small">launch free and let real users rank you.</p>
            <Link href="/submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>launch a product</Link>
          </div>
          <div className="card-soft card-pad stack-sm">
            <p style={{ fontWeight: 650 }}>no sponsored rows</p>
            <p className="muted small">nothing on this list is paid for. position is earned only.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
