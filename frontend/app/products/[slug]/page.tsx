import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import Icon from "@/components/Icon";
import LogoBadge from "@/components/LogoBadge";
import TryPanel from "@/components/TryPanel";
import UpvoteButton from "@/components/UpvoteButton";
import { ApiError, apiFetch, hasSession } from "@/lib/api";
import { SITE_URL } from "@/lib/config";
import { formatScore, stars, timeAgo } from "@/lib/format";
import type { FeedbackView, PageResponse, ProductDetail, ProductSummary, ViewerState } from "@/lib/types";

export const dynamic = "force-dynamic";

/** keep in sync with backend app.engagement.min-try-seconds (copy only, the server enforces it). */
const MIN_TRY_SECONDS = 45;

async function load(slug: string): Promise<ProductDetail> {
  try {
    return await apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { product } = await apiFetch<ProductDetail>(`/products/${encodeURIComponent(params.slug)}`, { auth: false });
    return {
      title: `${product.name}: ${product.tagline}`,
      description: product.tagline,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: { title: product.name, description: product.tagline, type: "website" },
    };
  } catch {
    return { title: "product not found" };
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const detail = await load(params.slug);
  const p = detail.product;

  const [feedback, related, viewer] = await Promise.all([
    apiFetch<PageResponse<FeedbackView>>(`/products/${p.id}/tries?size=20`, { auth: false }),
    apiFetch<PageResponse<ProductSummary>>(`/products?category=${encodeURIComponent(p.categorySlug)}&period=all&size=4`, { auth: false }).catch(() => null),
    hasSession() ? apiFetch<ViewerState>(`/products/${p.id}/viewer`).catch(() => null) : Promise.resolve(null),
  ]);
  const others = (related?.content ?? []).filter((r) => r.id !== p.id).slice(0, 3);
  const isOwner = viewer?.owner === true;

  // backlinks are earned: nofollow until the product has enough well rated verified tries.
  const linkRel = p.earnedDofollow ? "noopener noreferrer" : "noopener noreferrer nofollow ugc";
  const total = Math.max(p.score, 0.0001);
  const upShare = Math.round((p.upvotePoints / total) * 100);
  const tryShare = 100 - upShare;

  const badgeUrl = `${SITE_URL}/badge/${p.slug}`;
  const embed = `<a href="${SITE_URL}/products/${p.slug}"><img src="${badgeUrl}" alt="${p.name} on prooflaunch" height="28"></a>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    description: p.tagline,
    url: `${SITE_URL}/products/${p.slug}`,
    applicationCategory: p.categoryName,
    sameAs: detail.websiteUrl,
    ...(p.tryCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.avgRating, ratingCount: p.tryCount, bestRating: 5, worstRating: 1 } }
      : {}),
  };

  return (
    <div className="container">
      <script
        type="application/ld+json"
        // escape "<" so user content can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="crumbs" aria-label="breadcrumb">
        <Link href="/launches">launches</Link>
        <span>/</span>
        <Link href={`/launches?category=${p.categorySlug}`}>{p.categoryName.toLowerCase()}</Link>
        <span>/</span>
        <span style={{ color: "var(--ink)" }}>{p.name}</span>
      </nav>

      <header className="card product-hero">
        <LogoBadge name={p.name} logoUrl={p.logoUrl} size={84} />
        <div className="grow">
          <h1>{p.name}</h1>
          <p className="lead" style={{ fontSize: "1.05rem", marginTop: 6 }}>{p.tagline}</p>
          <div className="meta" style={{ marginTop: 12 }}>
            <Link href={`/launches?category=${p.categorySlug}`} className="tag">{p.categoryName.toLowerCase()}</Link>
            <span className="m"><Icon name="users" size={14} /> by {p.makerName}</span>
            {p.verifiedMaker && <span className="verified"><Icon name="shield" size={13} /> verified maker</span>}
            <span className="m"><Icon name="calendar" size={14} /> launched {p.launchDate}</span>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <a className="btn btn-dark" href={detail.websiteUrl} target="_blank" rel={linkRel}>
              visit website <Icon name="external" size={15} />
            </a>
            {p.earnedDofollow && <span className="tag tag-brand"><Icon name="link" size={13} /> earned dofollow link</span>}
            {isOwner && (
              <Link href={`/products/${p.slug}/edit`} className="btn btn-secondary">
                <Icon name="edit" size={15} /> edit
              </Link>
            )}
          </div>
        </div>
        <UpvoteButton productId={p.id} initialCount={p.upvoteCount} initialUpvoted={p.viewerUpvoted} />
      </header>

      <div className="layout-2" style={{ marginTop: "1.5rem" }}>
        <div className="stack-lg">
          {detail.description && (
            <section className="card card-pad">
              <h2 className="section-title">about {p.name}</h2>
              <p style={{ whiteSpace: "pre-wrap", color: "var(--ink-2)" }}>{detail.description}</p>
            </section>
          )}

          <TryPanel productId={p.id} productName={p.name} websiteUrl={detail.websiteUrl} minSeconds={MIN_TRY_SECONDS} />

          <section className="card card-pad" aria-labelledby="fb">
            <div className="spread" style={{ marginBottom: "1rem" }}>
              <h2 className="section-title" id="fb" style={{ margin: 0 }}>verified feedback ({feedback.totalElements})</h2>
              {p.tryCount > 0 && <span className="tag"><span className="stars">★</span> {p.avgRating.toFixed(1)} average</span>}
            </div>
            {feedback.content.length === 0 ? (
              <p className="muted">no verified tries yet. be the first to try it and vouch for it.</p>
            ) : (
              <ul className="feedback">
                {feedback.content.map((f) => (
                  <li key={f.id}>
                    <span className="initial">{f.author.slice(0, 1).toLowerCase()}</span>
                    <div>
                      <p className="small">
                        <strong>{f.author}</strong>{" "}
                        <span className="stars" aria-label={`${f.rating} out of 5`}>{stars(f.rating)}</span>{" "}
                        <span className="muted">{timeAgo(f.completedAt)}</span>
                      </p>
                      <p style={{ whiteSpace: "pre-wrap", color: "var(--ink-2)", marginTop: 2 }}>{f.feedback}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="rail" aria-label="score and tools">
          <section className="card card-pad" aria-labelledby="score">
            <div className="spread">
              <h2 className="section-title" id="score" style={{ margin: 0 }}>proof score</h2>
              <Link href="/how-scoring-works" className="xs muted">how it works</Link>
            </div>
            <p className="score-big" style={{ marginTop: 12 }}>{formatScore(p.score)}</p>
            <div className="stack-bar" role="img" aria-label={`${upShare} percent from upvotes, ${tryShare} percent from verified tries`}>
              <i style={{ width: `${upShare}%`, background: "#a8c9c3" }} />
              <i style={{ width: `${tryShare}%`, background: "var(--brand)" }} />
            </div>
            <div className="legend">
              <div><span><i className="dot" style={{ background: "#a8c9c3" }} />from {p.upvoteCount} upvotes</span><b>{formatScore(p.upvotePoints)}</b></div>
              <div><span><i className="dot" style={{ background: "var(--brand)" }} />from verified tries (4x)</span><b>{formatScore(p.tryPoints)}</b></div>
            </div>
            <div className="stat-grid">
              <div className="stat"><b>{p.tryCount}</b><span>verified tries</span></div>
              <div className="stat"><b>{p.tryCount > 0 ? p.avgRating.toFixed(1) : "none"}</b><span>average rating</span></div>
              <div className="stat"><b>{p.tryStartedCount}</b><span>tries started</span></div>
              <div className="stat"><b>{p.tryStartedCount > 0 ? `${Math.round((p.tryCount / p.tryStartedCount) * 100)}%` : "none"}</b><span>completed</span></div>
            </div>
          </section>

          {isOwner && (
            <section className="card card-pad stack-sm" aria-labelledby="badge">
              <h2 className="section-title" id="badge" style={{ margin: 0 }}>add the badge to your site</h2>
              <p className="muted small">shows your live proof score. paste it in your footer.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/badge/${p.slug}`} alt={`${p.name} proof badge`} height={28} />
              <code className="code">{embed}</code>
              <CopyButton text={embed} label="copy embed code" />
            </section>
          )}

          {others.length > 0 && (
            <section className="card card-pad" aria-labelledby="more">
              <h2 className="section-title" id="more">more in {p.categoryName.toLowerCase()}</h2>
              <ul className="stack">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/products/${o.slug}`} className="row" style={{ flexWrap: "nowrap" }}>
                      <LogoBadge name={o.name} logoUrl={o.logoUrl} size={36} />
                      <span style={{ minWidth: 0 }}>
                        <b style={{ display: "block", fontSize: "0.93rem" }}>{o.name}</b>
                        <span className="muted xs">{o.tryCount} verified {o.tryCount === 1 ? "try" : "tries"}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
