"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container" style={{ paddingBlock: "4rem" }}>
      <div className="card empty">
        <h1 className="h2">something went wrong</h1>
        <p>we could not load this page. the api may be restarting, so please try again.</p>
        <button className="btn btn-primary" onClick={reset}>try again</button>
      </div>
    </div>
  );
}
