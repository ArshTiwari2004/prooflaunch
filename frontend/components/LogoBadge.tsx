export default function LogoBadge({ name, logoUrl, size = 56 }: { name: string; logoUrl: string | null; size?: number }) {
  const radius = Math.round(size * 0.25);
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="" width={size} height={size} className="logo" style={{ borderRadius: radius }} loading="lazy" referrerPolicy="no-referrer" />;
  }
  return (
    <div className="logo logo-fallback" style={{ width: size, height: size, fontSize: size * 0.4, borderRadius: radius }} aria-hidden="true">
      {name.slice(0, 1).toLowerCase()}
    </div>
  );
}
