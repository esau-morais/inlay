export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <rect
        x="1.75"
        y="1.75"
        width="16.5"
        height="16.5"
        rx="4.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="5.5" y="9.5" width="9" height="5" rx="1.25" fill="currentColor" />
    </svg>
  );
}
