import { ImageIcon } from "lucide-react";
import { withBase } from "@/lib/asset";

/**
 * Product-screenshot slot. Renders the image when `src` is set, else a labelled
 * placeholder (used in dev to see where a visual goes).
 *
 * `chrome` wraps the screenshot in a browser frame so flat captures read as real
 * product UI: "dark" (navy bar + traffic lights + URL, for dark sections) or
 * "light" (mist bar, for light sections). Pass `url` to show an address.
 *
 * Static export ⇒ a plain <img> (unoptimized), not next/image.
 */
export function MediaFrame({
  src,
  alt,
  caption,
  className = "",
  chrome,
  url,
}: {
  src?: string | null;
  alt: string;
  caption?: string;
  className?: string;
  chrome?: "dark" | "light";
  url?: string;
}) {
  // Préfixe l'asset public par le basePath (servi sous /showcase/ → /_next et <Link> sont préfixés
  // par Next, mais pas ce <img> brut). Idempotent + sans effet sur les URLs externes (cover partenaire).
  const resolved = withBase(src);
  if (resolved && chrome) {
    const dark = chrome === "dark";
    return (
      <div
        className={`overflow-hidden rounded-xl border shadow-[0_30px_70px_-28px_rgba(0,0,0,0.5)] ${
          dark ? "border-white/10" : "border-line"
        } ${className}`}
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-2.5 ${
            dark ? "bg-[#0a1f33]" : "border-b border-line bg-mist"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          {url && (
            <span className={`ml-2.5 truncate text-[11px] ${dark ? "text-[#7d93a6]" : "text-muted"}`}>
              {url}
            </span>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolved} alt={alt} className="block w-full" />
      </div>
    );
  }
  if (resolved) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={resolved}
        alt={alt}
        className={`w-full rounded-xl border border-line object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-mist text-muted ${className}`}
    >
      <ImageIcon size={28} />
      {caption && <span className="text-xs">{caption}</span>}
    </div>
  );
}
