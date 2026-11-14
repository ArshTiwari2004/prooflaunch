export default function Loading() {
  return (
    <div className="container" aria-busy="true" aria-label="loading launches">
      <div className="page-head">
        <div className="skeleton" style={{ height: 40, width: 220 }} />
      </div>
      <div className="list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 96 }} />
        ))}
      </div>
    </div>
  );
}
