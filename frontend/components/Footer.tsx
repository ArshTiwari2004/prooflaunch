import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <Logo />
              <span>prooflaunch</span>
            </div>
            <p className="muted small" style={{ marginTop: "0.9rem", maxWidth: "34ch" }}>
              the launch platform ranked by verified usage. votes are cheap, proof is not.
            </p>
          </div>
          <div>
            <h4>product</h4>
            <ul>
              <li><Link href="/launches">launches</Link></li>
              <li><Link href="/submit">launch a product</Link></li>
              <li><Link href="/pricing">pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4>learn</h4>
            <ul>
              <li><Link href="/how-scoring-works">how ranking works</Link></li>
              <li><Link href="/pricing#faq">faq</Link></li>
            </ul>
          </div>
          <div>
            <h4>account</h4>
            <ul>
              <li><Link href="/login">sign in</Link></li>
              <li><Link href="/register">create account</Link></li>
              <li><Link href="/dashboard">dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} prooflaunch</span>
          <span>no paid ranking, ever</span>
        </div>
      </div>
    </footer>
  );
}
