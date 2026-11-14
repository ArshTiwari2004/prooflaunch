import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ paddingBlock: "4rem" }}>
      <div className="card empty">
        <h1 className="h2">page not found</h1>
        <p>that page does not exist, or the product was removed.</p>
        <Link href="/launches" className="btn btn-primary">back to launches</Link>
      </div>
    </div>
  );
}
