export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold text-navy ${className}`}>
      <svg viewBox="0 0 132 116" width="22" height="20" aria-hidden="true">
        <polygon points="6,8 126,8 66,108" fill="#0F9ED5" />
      </svg>
      <span className="text-[18px] leading-none">
        Sky<span className="text-sky">RH</span>
      </span>
    </span>
  );
}
