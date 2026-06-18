import { ImageIcon } from "lucide-react";

/**
 * Product-screenshot slot. Renders the image when `src` is set, else a labelled
 * placeholder (used in dev to see where a visual goes). Callers that want zero
 * clutter pre-launch should gate on the src (e.g. `{m.cover && <MediaFrame …/>}`).
 *
 * To populate: drop a file in `public/…` (or host it on the backend) and point the
 * source at it — module pages read the catalog `cover` field; set it to that path.
 * Static export ⇒ a plain <img> (unoptimized), not next/image.
 */
export function MediaFrame({
  src,
  alt,
  caption,
  className = "",
}: {
  src?: string | null;
  alt: string;
  caption?: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
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
