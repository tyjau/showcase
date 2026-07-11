import { withBase } from "@/lib/asset";
import manifest from "@/lib/image-manifest.json";

// Variantes garanties uniquement pour un PNG local (scripts/optimize-images.mjs les génère et elles
// sont committées). Une URL externe (cover partenaire) retombe sur un <img> simple.
const LOCAL_PNG = /^\/.+\.png$/i;

// Dimensions intrinsèques par chemin public, générées par le même script. Posées en width/height,
// elles donnent au navigateur l'aspect-ratio avant le chargement : la place est réservée, donc aucun
// décalage de mise en page (CLS). Sur un <img> déjà contraint par CSS (heros en `h-full w-full`),
// les attributs sont simplement sans effet.
const DIMENSIONS = manifest as Record<string, { w: number; h: number }>;

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
 * `width`/`height` sont déduits du manifeste quand ils ne sont pas fournis → aspect-ratio réservé
 * avant le chargement, donc CLS supprimé sur les images qui participent au flux (captures, carrousel).
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
  const dims = DIMENSIONS[src];
  return (
    <picture className="contents">
      {variants && <source srcSet={withBase(`${stem}.avif`)} type="image/avif" />}
      {variants && <source srcSet={withBase(`${stem}.webp`)} type="image/webp" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase(src)}
        alt={alt}
        aria-hidden={ariaHidden || undefined}
        width={width ?? dims?.w}
        height={height ?? dims?.h}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
