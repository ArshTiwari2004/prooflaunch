"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import WaitlistForm from "./WaitlistForm";

const FREE = [
  "launch your product, forever free",
  "ranked by verified tries and trust weighted votes",
  "public proof score breakdown on your page",
  "earned dofollow backlink (3+ tries, 3.5 star average)",
  "embeddable proof badge for your own site",
  "maker dashboard with your try funnel",
  "verified maker badge with a matching email domain",
  "up to 3 launches per day",
];

const PRO = [
  "everything in free",
  "feedback analytics: drop off, ratings over time",
  "export all feedback as csv",
  "schedule your launch up to 14 days ahead",
  "private invite links for your existing users",
  "3 team seats on one product",
  "priority email support",
];

export default function PlanCards({ compact = false }: { compact?: boolean }) {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="stack-lg">
      <div className="center">
        <div className="toggle" role="group" aria-label="billing period">
          <button type="button" className={!yearly ? "active" : ""} onClick={() => setYearly(false)} aria-pressed={!yearly}>
            monthly
          </button>
          <button type="button" className={yearly ? "active" : ""} onClick={() => setYearly(true)} aria-pressed={yearly}>
            yearly <span className="tag tag-brand" style={{ marginLeft: 6 }}>save 33%</span>
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ maxWidth: 880, marginInline: "auto" }}>
        <article className="card plan">
          <div>
            <h3 className="h3">free</h3>
            <p className="muted small" style={{ marginTop: 4 }}>everything you need to launch and be judged fairly.</p>
          </div>
          <p className="price">$0<small>forever</small></p>
          <Link href="/submit" className="btn btn-secondary btn-lg btn-block">launch for free</Link>
          <ul>
            {FREE.map((f) => (
              <li key={f}><Icon name="check" size={16} /> {f}</li>
            ))}
          </ul>
        </article>

        <article className="card plan featured">
          <span className="ribbon">early access</span>
          <div>
            <h3 className="h3">pro</h3>
            <p className="muted small" style={{ marginTop: 4 }}>sharper tools for makers who iterate. never a ranking boost.</p>
          </div>
          <p className="price">
            {yearly ? "$8" : "$12"}
            <small>per month{yearly ? ", billed $96 yearly" : ""}</small>
          </p>
          {compact ? (
            <Link href="/pricing#waitlist" className="btn btn-primary btn-lg btn-block">join the pro waitlist</Link>
          ) : (
            <div id="waitlist">
              <WaitlistForm plan="pro" />
            </div>
          )}
          <ul>
            {PRO.map((f, i) => (
              <li key={f} className={i === 0 ? "" : "soon"}>
                <Icon name="check" size={16} /> {f}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
