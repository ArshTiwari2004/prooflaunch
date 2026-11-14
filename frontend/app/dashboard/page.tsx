import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteProductButton from "@/components/DeleteProductButton";
import Icon from "@/components/Icon";
import LogoBadge from "@/components/LogoBadge";
import { ApiError, apiFetch, hasSession } from "@/lib/api";
import { formatScore } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "maker dashboard", robots: { index: false } };

export default async function Dashboard() {
  if (!hasSession()) redirect("/login?next=/dashboard");
  let products: ProductSummary[];
  try {
    products = await apiFetch<ProductSummary[]>("/me/products");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login?next=/dashboard");
    throw e;
  }

  const started = products.reduce((n, p) => n + p.tryStartedCount, 0);
  const completed = products.reduce((n, p) => n + p.tryCount, 0);
  const upvotes = products.reduce((n, p) => n + p.upvoteCount, 0);
  const rated = products.filter((p) => p.tryCount > 0);
  const avg = rated.length ? rated.reduce((n, p) => n + p.avgRating, 0) / rated.length : 0;

  const kpis = [
    { label: "products launched", value: String(products.length) },
    { label: "total upvotes", value: String(upvotes) },
    { label: "verified tries", value: String(completed) },
    { label: "average rating", value: rated.length ? avg.toFixed(1) : "none yet" },
  ];

  return (
    <div className="container">
      <div className="page-head spread">
        <div>
          <h1 className="h1">maker dashboard</h1>
          <p>your funnel, honestly: who started a try, who finished, and what they thought.</p>
        </div>
        <Link href="/submit" className="btn btn-primary"><Icon name="plus" size={16} /> launch a product</Link>
      </div>

      <div className="kpis">
        {kpis.map((k) => (
          <div key={k.label} className="card kpi">
            <b>{k.value}</b>
            <span>{k.label}</span>
          </div>
        ))}
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2 className="h3" style={{ marginBottom: 12 }}>your products</h2>
        {products.length === 0 ? (
          <div className="card empty">
            <h3 className="h3">you have not launched anything yet</h3>
            <p>it takes two minutes and it is free.</p>
            <Link href="/submit" className="btn btn-primary">launch your first product</Link>
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>product</th>
                  <th>proof</th>
                  <th>upvotes</th>
                  <th>try funnel</th>
                  <th>rating</th>
                  <th aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const startedPct = started > 0 ? 100 : 0;
                  const donePct = p.tryStartedCount > 0 ? Math.round((p.tryCount / p.tryStartedCount) * 100) : 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/products/${p.slug}`} className="row" style={{ flexWrap: "nowrap" }}>
                          <LogoBadge name={p.name} logoUrl={p.logoUrl} size={36} />
                          <span>
                            <b style={{ display: "block" }}>{p.name}</b>
                            <span className="muted xs">launched {p.launchDate}</span>
                          </span>
                        </Link>
                      </td>
                      <td><b>{formatScore(p.score)}</b></td>
                      <td>{p.upvoteCount}</td>
                      <td>
                        <div className="funnel">
                          <span className="xs muted">{p.tryStartedCount} started, {p.tryCount} finished ({donePct}%)</span>
                          <div className="bar alt"><i style={{ width: `${startedPct}%` }} /></div>
                          <div className="bar"><i style={{ width: `${donePct}%` }} /></div>
                        </div>
                      </td>
                      <td>{p.tryCount > 0 ? <span className="row"><span className="stars">★</span>{p.avgRating.toFixed(1)}</span> : <span className="muted">none yet</span>}</td>
                      <td>
                        <div className="row" style={{ flexWrap: "nowrap" }}>
                          <Link className="btn btn-secondary btn-sm" href={`/products/${p.slug}/edit`}><Icon name="edit" size={14} /> edit</Link>
                          <DeleteProductButton id={p.id} name={p.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-soft card-pad" style={{ marginTop: "2rem" }}>
        <div className="spread">
          <div>
            <p style={{ fontWeight: 650 }}>you are on the free plan</p>
            <p className="muted small">pro adds analytics, csv export and launch scheduling. it never changes your rank.</p>
          </div>
          <Link href="/pricing" className="btn btn-secondary">see pro</Link>
        </div>
      </section>
    </div>
  );
}
