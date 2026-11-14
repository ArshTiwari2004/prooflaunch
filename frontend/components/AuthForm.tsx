"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readProblem, safeNext } from "@/lib/client";
import Icon, { IconName } from "./Icon";

const PERKS: { icon: IconName; title: string; text: string }[] = [
  { icon: "shield", title: "ranked by proof", text: "verified tries decide the leaderboard, not vote trading." },
  { icon: "chart", title: "see your funnel", text: "who started a try, who finished, and what they said." },
  { icon: "link", title: "earn your backlink", text: "dofollow unlocks through real tries. never for sale." },
];

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const body = mode === "login" ? { email, password } : { email, displayName, password };
    const res = await fetch(`/bff/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const problem = await readProblem(res);
      setError(problem.message);
      setFieldErrors(problem.fieldErrors);
      setBusy(false);
      return;
    }
    router.push(safeNext(next));
    router.refresh();
  }

  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";
  const login = mode === "login";

  return (
    <div className="auth-wrap">
      <div className="auth-form">
        <form className="inner stack-lg" onSubmit={submit} noValidate>
          <div>
            <h1 className="h1">{login ? "welcome back" : "create your account"}</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              {login ? "sign in to vote, try products and manage your launches." : "free forever. launch in under two minutes."}
            </p>
          </div>
          <div className="stack">
            {!login && (
              <div className="field">
                <label htmlFor="name">display name</label>
                <input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" required minLength={2} maxLength={60} aria-invalid={Boolean(fieldErrors.displayName)} />
                {fieldErrors.displayName && <span className="err">{fieldErrors.displayName}</span>}
              </div>
            )}
            <div className="field">
              <label htmlFor="email">email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="you@company.com" aria-invalid={Boolean(fieldErrors.email)} />
              {fieldErrors.email && <span className="err">{fieldErrors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="password">
                password {!login && <span className="hint">(at least 10 characters)</span>}
              </label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={login ? "current-password" : "new-password"} required maxLength={72} aria-invalid={Boolean(fieldErrors.password)} />
              {fieldErrors.password && <span className="err">{fieldErrors.password}</span>}
            </div>
            {error && (
              <p className="alert alert-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
              {busy ? "please wait..." : login ? "sign in" : "create account"}
              {!busy && <Icon name="arrow-right" size={16} />}
            </button>
          </div>
          <p className="muted small center">
            {login ? (
              <>
                new here? <Link href={`/register${nextQuery}`} style={{ color: "var(--brand)", fontWeight: 600 }}>create an account</Link>
              </>
            ) : (
              <>
                already have an account? <Link href={`/login${nextQuery}`} style={{ color: "var(--brand)", fontWeight: 600 }}>sign in</Link>
              </>
            )}
          </p>
        </form>
      </div>
      <aside className="auth-side" aria-label="why prooflaunch">
        <div style={{ maxWidth: 380 }}>
          <span className="eyebrow">votes are cheap, proof is not</span>
          <h2 className="h2" style={{ marginTop: 14 }}>
            launch where people <span className="serif">actually try</span> your product
          </h2>
          <ul>
            {PERKS.map((p) => (
              <li key={p.title}>
                <span className="ico"><Icon name={p.icon} size={17} /></span>
                <span>
                  <b style={{ display: "block", fontSize: "0.95rem" }}>{p.title}</b>
                  <span className="muted small">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
