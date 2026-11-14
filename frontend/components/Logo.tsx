export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="prooflaunch">
      <rect width="32" height="32" rx="9" fill="#0f5f55" />
      <path d="M9 17.5 14 22.5 23.5 10" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.5" cy="8" r="2.5" fill="#fdba74" />
    </svg>
  );
}
