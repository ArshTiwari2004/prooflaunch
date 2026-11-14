"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { readProblem } from "@/lib/client";
import type { TryStartResponse, ViewerState } from "@/lib/types";
import Icon from "./Icon";

interface Props {
  productId: number;
  productName: string;
  websiteUrl: string;
  /** copy only. the server enforces the real rule (app.engagement.min-try-seconds). */
  minSeconds: number;
}

/** the verified try flow: start, use the product, wait for the unlock, then rate and write feedback. */
export default function TryPanel({ productId, productName, websiteUrl, minSeconds }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ViewerState | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/bff/products/${productId}/viewer`, { cache: "no-store" });
    if (res.ok) {
      const s = (await res.json()) as ViewerState;
      setState(s);
      setRemaining(s.secondsRemaining);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  // countdown. the server clock is the source of truth, this is only ux.
  useEffect(() => {
    if (state?.tryStatus !== "STARTED" || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [state?.tryStatus, remaining]);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/bff/products/${productId}/try/start`, { method: "POST" });
    setBusy(false);
    if (res.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!res.ok) {
      setError((await readProblem(res)).message);
      return;
    }
    const data = (await res.json()) as TryStartResponse;
    setState((prev) => ({
      authenticated: true,
      owner: false,
      upvoted: prev?.upvoted ?? false,
      tryStatus: data.status === "COMPLETED" ? "COMPLETED" : "STARTED",
      secondsRemaining: data.secondsRemaining,
      rating: null,
    }));
    setRemaining(data.secondsRemaining);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/bff/products/${productId}/try/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, feedback }),
    });
    setBusy(false);
    if (!res.ok) {
      const problem = await readProblem(res);
      setError(problem.fieldErrors.feedback ? `feedback ${problem.fieldErrors.feedback}` : problem.message);
      return;
    }
    await load();
    router.refresh();
  }

  if (!state) {
    return (
      <section className="card card-pad" aria-busy="true">
        <div className="skeleton" style={{ height: 22, width: "40%" }} />
        <div className="skeleton" style={{ height: 14, width: "80%", marginTop: 14 }} />
        <div className="skeleton" style={{ height: 40, width: 150, marginTop: 18 }} />
      </section>
    );
  }

  if (state.owner) {
    return (
      <section className="card card-pad">
        <h2 className="h3">this is your product</h2>
        <p className="muted small" style={{ marginTop: 6 }}>
          makers cannot vote or try their own product. share the link and let real users judge it.
        </p>
      </section>
    );
  }

  if (state.tryStatus === "COMPLETED") {
    return (
      <section className="card card-pad">
        <div className="row">
          <span className="tag tag-brand">
            <Icon name="check" size={13} /> verified
          </span>
        </div>
        <h2 className="h3" style={{ marginTop: 10 }}>thanks for vouching</h2>
        <p className="muted small" style={{ marginTop: 6 }}>
          your verified try{state.rating ? ` (${state.rating} of 5)` : ""} now counts toward the proof score.
        </p>
      </section>
    );
  }

  const stepIndex = !state.authenticated || state.tryStatus === "NONE" ? 0 : remaining > 0 ? 1 : 2;

  return (
    <section className="card card-pad" aria-labelledby="try-title">
      <h2 className="h3" id="try-title">try it, then vouch for it</h2>
      <p className="muted small" style={{ marginTop: 6 }}>
        use {productName} for at least {minSeconds} seconds, then rate it and leave honest feedback. a verified try is worth four upvotes.
      </p>
      <div className="stepper" aria-hidden="true">
        {["start", "use it", "vouch"].map((s, i) => (
          <div key={s} className={i <= stepIndex ? "done" : ""}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {!state.authenticated && (
        <button className="btn btn-primary" onClick={start} disabled={busy}>
          sign in to try
        </button>
      )}

      {state.authenticated && state.tryStatus === "NONE" && (
        <button className="btn btn-primary" onClick={start} disabled={busy}>
          {busy ? "starting..." : "start my try"}
        </button>
      )}

      {state.authenticated && state.tryStatus === "STARTED" && (
        <div className="stack">
          <a className="btn btn-secondary" href={websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
            open {productName}
            <Icon name="external" size={15} />
          </a>
          {remaining > 0 ? (
            <p className="alert alert-ok" role="status">
              feedback unlocks in <strong>{remaining}s</strong>. take a proper look first.
            </p>
          ) : (
            <form onSubmit={submit} className="stack">
              <fieldset className="rating">
                <legend>your rating</legend>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className={n <= rating ? "star on" : "star"}>
                    <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
                    <span aria-hidden="true">★</span>
                    <span className="sr-only">{n} stars</span>
                  </label>
                ))}
              </fieldset>
              <div className="field">
                <label htmlFor="feedback">what did you try, and how did it go?</label>
                <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} minLength={10} maxLength={1000} rows={4} required placeholder="be specific. makers read every word." />
                <span className="counter">{feedback.length} / 1000</span>
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy || feedback.trim().length < 10}>
                {busy ? "submitting..." : "submit verified try"}
              </button>
            </form>
          )}
        </div>
      )}
      {error && (
        <p className="alert alert-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
    </section>
  );
}
