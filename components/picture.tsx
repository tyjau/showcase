import { withBase } from "@/lib/asset";

// Variantes garanties uniquement pour un PNG local (scripts/optimize-images.mjs les génère et elles
// sont committées). Une URL externe (cover partenaire) retombe sur un <img> simple.
const LOCAL_PNG = /^\/.+\.png$/i;

/**
 * Image servie via <picture> : AVIF → WebP → PNG (repli). L'export statique n'optimise pas les
 * images (next/image exigerait un loader), d'où le pré-encodage par `npm run img:optimize`.
 *
 * ⚠️ <picture> sélectionne la <source> selon le TYPE supporté, PAS selon le succès du chargement :
 * une variante manquante casse l'image sans repli sur le <img>. On n'émet donc les <source> que
 * pour les PNG locaux, dont on sait que les variantes existent.
 *
 * `priority` : réservé à l'image LCP (hero) → chargement immédiat + priorité réseau haute. Sinon
 * `loading="lazy"`, ce qui diffère tout ce qui est hors écran.
 *
 * `className="contents"` sur <picture> : aucun bloc généré, le <img> se positionne comme s'il était
 * enfant direct — indispensable pour les heros en `absolute inset-0` relatifs à leur <section>.
 */
export function Picture({
  src,
  alt,
  className = "",
  priority = false,
  width,
  height,
  ariaHidden = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  ariaHidden?: boolean;
}) {
  const variants = LOCAL_PNG.test(src);
  const stem = src.slice(0, -4);
  return (
    <picture className="contents">
      {variants && <source srcSet={withBase(`${stem}.avif`)} type="image/avif" />}
      {variants && <source srcSet={withBase(`${stem}.webp`)} type="image/webp" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase(src)}
        alt={alt}
        aria-hidden={ariaHidden || undefined}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
