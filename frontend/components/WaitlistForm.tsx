"use client";

import { useState } from "react";
import { readProblem } from "@/lib/client";
import Icon from "./Icon";

export default function WaitlistForm({ plan = "pro" }: { plan?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    const res = await fetch("/bff/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan }),
    });
    if (!res.ok) {
      setError((await readProblem(res)).message);
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <p className="alert alert-ok" role="status">
        <Icon name="check" size={14} /> you are on the list. we will email you when pro opens.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="stack-sm" noValidate>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <label className="sr-only" htmlFor={`wl-${plan}`}>email address</label>
        <input id={`wl-${plan}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
        <button className="btn btn-primary" type="submit" disabled={state === "busy"}>
          {state === "busy" ? "joining..." : "join waitlist"}
        </button>
      </div>
      {error && <p className="err small" role="alert">{error}</p>}
    </form>
  );
}
