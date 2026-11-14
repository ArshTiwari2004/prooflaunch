import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = {
  title: "how ranking works",
  description: "the proof score explained: verified tries, trust weighted votes, earned backlinks and zero paid placement.",
};

export default function HowScoringWorks() {
  return (
    <div className="container-narrow" style={{ paddingBlock: "3rem" }}>
      <span className="eyebrow"><Icon name="eye" size={14} /> fully transparent</span>
      <h1 className="h1" style={{ marginTop: 14 }}>how ranking works</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        most launch boards rank by raw upvotes, and upvotes are the easiest thing on the internet to fake. prooflaunch ranks by <strong>proof score</strong>, a formula we publish in full and show on every product.
      </p>

      <div className="card card-pad" style={{ marginTop: 28 }}>
        <p className="muted small" style={{ fontWeight: 600 }}>the formula</p>
        <p style={{ fontSize: "1.35rem", fontWeight: 650, letterSpacing: "-0.02em", marginTop: 6 }}>
          proof score = upvote points + verified try points
        </p>
        <hr className="divider" />
        <div className="grid-2">
          <div>
            <b>upvote points</b>
            <p className="muted small">the sum of each voter&apos;s trust weight. one upvote per person.</p>
          </div>
          <div>
            <b>verified try points</b>
            <p className="muted small">4 times the trust weights of verified tries rated 3 stars or higher.</p>
          </div>
        </div>
      </div>

      <div className="prose">
        <h2>what is a verified try?</h2>
        <ol>
          <li>you press start my try and open the product.</li>
          <li>feedback stays locked for at least 45 seconds, measured by our server clock, not yours.</li>
          <li>you rate it from 1 to 5 and write real feedback of 10 or more characters. one verified try per person per product.</li>
        </ol>
        <p style={{ marginTop: 12 }}>makers read your feedback, so a low effort or spammy try is visible and useless. makers can never vote on or try their own product.</p>

        <h2>trust weight</h2>
        <p>a brand new account counts for 25 percent. the weight grows in a straight line to 100 percent over the first 14 days.</p>
      </div>

      <div className="card table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr><th>account age</th><th>weight</th><th>one upvote is worth</th><th>one verified try is worth</th></tr>
          </thead>
          <tbody>
            <tr><td>day 0</td><td>0.25</td><td>0.25 points</td><td>1.0 points</td></tr>
            <tr><td>day 7</td><td>0.625</td><td>0.63 points</td><td>2.5 points</td></tr>
            <tr><td>day 14 and after</td><td>1.00</td><td>1.00 points</td><td>4.0 points</td></tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h2>earned backlinks</h2>
        <p>links from product pages are nofollow by default. once a product has <strong>3 or more verified tries with an average of 3.5 stars or higher</strong>, its link becomes a normal followed link, automatically. you cannot buy it. you earn it.</p>

        <h2>what we will never do</h2>
        <ul>
          <li>sell or boost ranking positions, or add promoted rows to the leaderboard.</li>
          <li>hide how a score was calculated.</li>
          <li>let makers vote on or rate their own product.</li>
        </ul>

        <h2>honest limits</h2>
        <p>we cannot see what you do on someone else&apos;s website, so a try is a strong signal, not a mathematical proof. we raise the cost of cheating with account age, dwell time, written feedback and one try per person, and we keep everything auditable.</p>
      </div>

      <p style={{ marginTop: 28 }}>
        <Link className="btn btn-primary btn-lg" href="/submit">launch your product <Icon name="arrow-right" size={16} /></Link>
      </p>
    </div>
  );
}
