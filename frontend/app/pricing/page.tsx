import type { Metadata } from "next";
import Link from "next/link";
import Faq, { FaqItem } from "@/components/Faq";
import Icon from "@/components/Icon";
import PlanCards from "@/components/PlanCards";

export const metadata: Metadata = {
  title: "pricing",
  description: "launching is free forever. pro adds analytics and scheduling for makers. paying never changes your rank.",
};

const FAQ: FaqItem[] = [
  { q: "why is launching free?", a: "because ranking by real usage only works when everyone can take part. a fair board should not charge for the chance to be judged." },
  { q: "what do other launch boards charge?", a: "many charge one time fees, commonly in the range of 12 to 99 dollars, for a homepage slot or a guaranteed dofollow link. we do not sell either, so there is nothing of that kind to buy here." },
  { q: "does pro change my ranking?", a: "never. pro gives you better tools, such as analytics, exports and scheduling. the ranking formula is identical for every product." },
  { q: "when does pro open?", a: "pro is in early access. join the waitlist below and we will email you once, when it opens." },
  { q: "can i cancel any time?", a: "yes. pro will be a simple subscription with no contract, and your free features stay free." },
];

const ROWS: [string, string, string][] = [
  ["launch a product", "yes", "yes"],
  ["ranked by verified tries", "yes", "yes"],
  ["public proof score breakdown", "yes", "yes"],
  ["earned dofollow backlink", "yes", "yes"],
  ["embeddable proof badge", "yes", "yes"],
  ["maker dashboard and try funnel", "yes", "yes"],
  ["launches per day", "3", "10"],
  ["feedback analytics over time", "no", "yes"],
  ["csv export of feedback", "no", "yes"],
  ["schedule a launch ahead", "no", "up to 14 days"],
  ["private invite links", "no", "yes"],
  ["team seats", "1", "3"],
  ["ranking boost", "none", "none"],
];

export default function Pricing() {
  return (
    <>
      <section className="section" style={{ paddingBottom: "2rem" }}>
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow"><Icon name="lock" size={14} /> no pay to rank</span>
            <h1 className="display" style={{ marginTop: 16, fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              free to launch. <span className="serif">fair</span> to everyone.
            </h1>
            <p className="lead">other boards sell visibility. we sell tools. nothing you can buy here moves you up the leaderboard.</p>
          </div>
          <PlanCards />
        </div>
      </section>

      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container-narrow">
          <h2 className="h2" style={{ marginBottom: "1.2rem" }}>compare plans</h2>
          <div className="card table-wrap">
            <table className="compare">
              <thead>
                <tr><th>feature</th><th>free</th><th>pro</th></tr>
              </thead>
              <tbody>
                {ROWS.map(([feature, free, pro]) => (
                  <tr key={feature}>
                    <td>{feature}</td>
                    <td className={free === "yes" ? "yes" : "muted"}>{free === "yes" ? <Icon name="check" size={17} /> : free}</td>
                    <td className={pro === "yes" ? "yes" : ""}>{pro === "yes" ? <Icon name="check" size={17} /> : pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>pro is in early access and the features above are being built in the order listed.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="promise">
            <h2 className="h2">our promise</h2>
            <p style={{ marginTop: 10, maxWidth: "60ch" }}>
              no promoted rows inside the leaderboard. no guaranteed backlinks. no hidden boosts. the formula is public, and it is the same for the free plan, the pro plan and for us.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link href="/how-scoring-works" className="btn btn-secondary">read how ranking works</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section section-soft" id="faq">
        <div className="container">
          <div className="section-head center">
            <h2 className="h2">pricing <span className="serif">questions</span></h2>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>
    </>
  );
}
