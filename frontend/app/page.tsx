import Link from "next/link";
import Faq, { FaqItem } from "@/components/Faq";
import Icon, { IconName } from "@/components/Icon";
import LogoBadge from "@/components/LogoBadge";
import PlanCards from "@/components/PlanCards";
import { apiFetch } from "@/lib/api";
import { formatScore } from "@/lib/format";
import type { PageResponse, ProductSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

const MARQUEE = [
  "ranked by verified tries",
  "no paid ranking, ever",
  "a public score on every product",
  "earned dofollow backlinks",
  "trust weighted votes",
  "built for makers",
];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "verified tries", text: "people open your product, spend real time, then rate it and write feedback. that is the signal we rank on." },
  { icon: "eye", title: "a score you can audit", text: "every product shows exactly where its points came from. no black box, no mystery boosts." },
  { icon: "link", title: "earned backlinks", text: "links start as nofollow and turn dofollow once real users vouch for you. never for sale." },
  { icon: "users", title: "trust weighted votes", text: "new accounts count for a quarter of a vote and grow to full weight in two weeks." },
  { icon: "chart", title: "a real maker funnel", text: "see who started a try, who finished, and the average rating, not just a vote count." },
  { icon: "badge", title: "embeddable badge", text: "show your live proof score on your own site with one line of html." },
  { icon: "lock", title: "fair by design", text: "no self voting, one try per person, https only links, duplicate detection and rate limits." },
  { icon: "zap", title: "launch in two minutes", text: "a short form, a live preview, and your page is up. free, with no queue and no review wait." },
];

const FAQ: FaqItem[] = [
  { q: "what is a verified try?", a: "you start a try, open the product, and feedback stays locked for 45 seconds on our server clock. then you rate it from 1 to 5 and write at least 10 characters of feedback. you get one try per product." },
  { q: "can makers pay to rank higher?", a: "no. nothing you can buy changes your position. the same formula applies to every product, and it is public on every product page." },
  { q: "how do i earn a dofollow backlink?", a: "your product link is nofollow by default. once you have 3 or more verified tries with an average rating of 3.5 or higher, it becomes a normal followed link automatically." },
  { q: "is launching really free?", a: "yes. launching, ranking, the maker dashboard, the embeddable badge and the earned backlink are all free forever." },
  { q: "how do you stop fake votes?", a: "we raise the cost of cheating: new accounts count for 25 percent, one vote and one try per person, a server enforced wait before feedback, written feedback that makers can read, and a block on voting for your own product. a try shows effort, not a mathematical proof, and we say so openly." },
  { q: "is pro available yet?", a: "pro is in early access. join the waitlist and we will email you when it opens. it adds analytics, exports and scheduling, and it never affects ranking." },
];

async function topLaunches(): Promise<ProductSummary[]> {
  try {
    const week = await apiFetch<PageResponse<ProductSummary>>("/products?period=week&size=3");
    if (week.content.length >= 3) return week.content;
    const all = await apiFetch<PageResponse<ProductSummary>>("/products?period=all&size=3");
    return all.content;
  } catch {
    return [];
  }
}

export default async function Landing() {
  const top = await topLaunches();

  return (
    <>
      {/* hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow fade-up">
              <Icon name="shield" size={14} /> ranked by proof, not hype
            </span>
            <h1 className="display fade-up d1">
              launch where people <span className="serif">actually try</span> your product.
            </h1>
            <p className="lead fade-up d2">
              upvotes are cheap. on prooflaunch, products climb by earning verified tries: real people who used them and said what they thought.
            </p>
            <div className="hero-cta fade-up d3">
              <Link href="/submit" className="btn btn-primary btn-lg">
                launch your product <Icon name="arrow-right" size={17} />
              </Link>
              <Link href="/launches" className="btn btn-secondary btn-lg">
                see this week&apos;s launches
              </Link>
            </div>
            <div className="hero-note fade-up d3">
              <span><Icon name="check" size={15} /> free forever</span>
              <span><Icon name="check" size={15} /> no paid ranking</span>
              <span><Icon name="check" size={15} /> live in two minutes</span>
            </div>
          </div>

          <div className="preview fade-up d2" aria-label="example of the leaderboard">
            <div className="preview-head">
              <span className="row"><Icon name="trophy" size={16} /> top launches this week</span>
              <span className="muted xs">ranked by proof score</span>
            </div>
            {top.length > 0 ? (
              top.map((p, i) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="preview-row">
                  <span className="rank top">{i + 1}</span>
                  <LogoBadge name={p.name} logoUrl={p.logoUrl} size={40} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>{p.name}</b>
                    <small>{p.tryCount} verified {p.tryCount === 1 ? "try" : "tries"}{p.tryCount > 0 ? `, ${p.avgRating.toFixed(1)} average` : ""}</small>
                  </span>
                  <span className="tag tag-brand">proof {formatScore(p.score)}</span>
                </Link>
              ))
            ) : (
              <>
                {["first launch", "second launch", "third launch"].map((n, i) => (
                  <div key={n} className="preview-row">
                    <span className="rank top">{i + 1}</span>
                    <LogoBadge name={n} logoUrl={null} size={40} />
                    <span style={{ flex: 1 }}>
                      <b>your product could be here</b>
                      <small>be the first to launch this week</small>
                    </span>
                  </div>
                ))}
              </>
            )}
            <div className="preview-foot">
              <Icon name="shield" size={16} />
              <span>score = upvote points + 4 x verified try points. fully public.</span>
            </div>
          </div>
        </div>
      </section>

      {/* marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}><Icon name="check" size={16} /> {m}</span>
          ))}
        </div>
      </div>

      {/* top launches */}
      {top.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="spread" style={{ marginBottom: "1.6rem" }}>
              <div>
                <h2 className="h2">this week&apos;s <span className="serif">best</span> launches</h2>
                <p className="muted" style={{ marginTop: 6 }}>ranked live by proof score.</p>
              </div>
              <Link href="/launches" className="btn btn-secondary">view all launches <Icon name="arrow-right" size={15} /></Link>
            </div>
            <div className="podium">
              {top.map((p, i) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="card podium-card">
                  <div className="spread">
                    <span className="pos">{i + 1}</span>
                    <LogoBadge name={p.name} logoUrl={p.logoUrl} size={44} />
                  </div>
                  <div>
                    <b style={{ fontSize: "1.1rem", letterSpacing: "-0.015em" }}>{p.name}</b>
                    <p className="muted small" style={{ marginTop: 2 }}>{p.tagline}</p>
                  </div>
                  <div className="meta">
                    <span className="m"><Icon name="shield" size={14} /> {p.tryCount} verified</span>
                    <span className="m"><Icon name="arrow-up" size={14} /> {p.upvoteCount}</span>
                    <span className="m"><Icon name="chart" size={14} /> proof {formatScore(p.score)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* how it works */}
      <section className="section section-soft" id="how">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">how it works</span>
            <h2 className="h2" style={{ marginTop: 14 }}>from launch to <span className="serif">proof</span> in three steps</h2>
            <p className="lead">no growth hacks, no vote trading. just people using your product and telling the truth about it.</p>
          </div>
          <div className="grid-3">
            <div className="card step">
              <div className="num">1</div>
              <h3 className="h3">you launch</h3>
              <p>fill a short form and your page is live instantly, with a public score and a try button.</p>
              <div className="mini-ui">
                <div className="row" style={{ justifyContent: "space-between" }}><b>your product</b><span className="tag tag-brand">live</span></div>
                <div className="bar" style={{ marginTop: 10 }}><i style={{ width: "100%" }} /></div>
              </div>
            </div>
            <div className="card step">
              <div className="num">2</div>
              <h3 className="h3">people try it</h3>
              <p>visitors open your product, spend at least 45 seconds, then rate it and write what they found.</p>
              <div className="mini-ui">
                <div className="row" style={{ justifyContent: "space-between" }}><span>feedback unlocks in</span><b>32s</b></div>
                <div className="bar" style={{ marginTop: 10 }}><i style={{ width: "30%" }} /></div>
              </div>
            </div>
            <div className="card step">
              <div className="num">3</div>
              <h3 className="h3">proof ranks you</h3>
              <p>verified tries are worth four upvotes. your score and your backlink grow from real usage.</p>
              <div className="mini-ui">
                <div className="row" style={{ justifyContent: "space-between" }}><span>proof score</span><b>35.0</b></div>
                <div className="bar" style={{ marginTop: 10 }}><i style={{ width: "72%" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">why prooflaunch</span>
            <h2 className="h2" style={{ marginTop: 14 }}>everything a launch board should be, <span className="serif">minus the noise</span></h2>
            <p className="lead">built so the best product wins, not the loudest one.</p>
          </div>
          <div className="grid-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card feature">
                <div className="ico"><Icon name={f.icon} size={20} /></div>
                <h3 className="h3">{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* comparison */}
      <section className="section section-soft">
        <div className="container-narrow">
          <div className="section-head center">
            <span className="eyebrow">the difference</span>
            <h2 className="h2" style={{ marginTop: 14 }}>votes are cheap. <span className="serif">proof isn&apos;t.</span></h2>
          </div>
          <div className="card table-wrap">
            <table className="compare">
              <thead>
                <tr><th />
                  <th>typical launch boards</th>
                  <th>prooflaunch</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>ranking signal</td><td>mostly raw upvotes</td><td className="yes">verified tries plus trust weighted votes</td></tr>
                <tr><td>why it ranks where it does</td><td>opaque</td><td className="yes">public score breakdown</td></tr>
                <tr><td>paid placement</td><td>promoted and premium shelves</td><td className="yes">none, ever</td></tr>
                <tr><td>dofollow backlink</td><td>often a paid perk</td><td className="yes">earned through real tries</td></tr>
                <tr><td>maker insight</td><td>counts and comments</td><td className="yes">funnel, ratings, written feedback</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">pricing</span>
            <h2 className="h2" style={{ marginTop: 14 }}>free to launch. <span className="serif">tools</span> if you want more.</h2>
            <p className="lead">we sell tools to makers, never visibility. paying never changes your rank.</p>
          </div>
          <PlanCards compact />
        </div>
      </section>

      {/* faq */}
      <section className="section section-soft" id="faq">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">faq</span>
            <h2 className="h2" style={{ marginTop: 14 }}>questions, <span className="serif">answered</span></h2>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>

      {/* cta */}
      <section className="section">
        <div className="container">
          <div className="cta">
            <h2 className="h1">your product deserves real feedback.</h2>
            <p>launch in two minutes and let real users decide where you rank.</p>
            <Link href="/submit" className="btn btn-primary btn-lg">launch your product <Icon name="arrow-right" size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
