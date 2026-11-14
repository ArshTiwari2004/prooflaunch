import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { formatScore } from "@/lib/format";
import Icon from "./Icon";
import LogoBadge from "./LogoBadge";
import UpvoteButton from "./UpvoteButton";

export default function ProductCard({ product, rank }: { product: ProductSummary; rank: number }) {
  return (
    <li className="card product-row">
      <span className={`rank ${rank <= 3 ? "top" : ""}`} aria-label={`rank ${rank}`}>
        {rank}
      </span>
      <LogoBadge name={product.name} logoUrl={product.logoUrl} />
      <div>
        <div className="product-title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
          {product.verifiedMaker && (
            <span className="verified" title="maker email domain matches the product website">
              <Icon name="shield" size={13} /> verified maker
            </span>
          )}
        </div>
        <p className="product-tagline">{product.tagline}</p>
        <div className="meta">
          <Link href={`/launches?category=${product.categorySlug}`} className="tag">
            {product.categoryName.toLowerCase()}
          </Link>
          <span className="m" title="people who used it and wrote feedback">
            <Icon name="shield" size={14} />
            {product.tryCount} verified {product.tryCount === 1 ? "try" : "tries"}
          </span>
          {product.tryCount > 0 && (
            <span className="m" title="average rating from verified tries">
              <Icon name="star" size={14} />
              {product.avgRating.toFixed(1)}
            </span>
          )}
          <span className="m" title="proof score = upvote points + verified try points">
            <Icon name="chart" size={14} />
            proof {formatScore(product.score)}
          </span>
        </div>
      </div>
      <UpvoteButton productId={product.id} initialCount={product.upvoteCount} initialUpvoted={product.viewerUpvoted} />
    </li>
  );
}
