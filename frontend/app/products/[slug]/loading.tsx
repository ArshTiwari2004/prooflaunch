export default function Loading() {
  return (
    <div className="container" aria-busy="true" aria-label="loading product" style={{ paddingTop: "2rem" }}>
      <div className="skeleton" style={{ height: 170 }} />
      <div className="layout-2" style={{ marginTop: "1.5rem" }}>
        <div className="stack">
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    </div>
  );
}
