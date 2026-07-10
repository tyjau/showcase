// Génère les variantes AVIF + WebP de chaque PNG de public/img, à côté du source.
//
// Pourquoi hors build : l'app est en `output: export` (export statique), où next/image n'optimise
// rien sans loader personnalisé. On pré-encode donc les variantes et on les committe ; le composant
// <Picture> les sert via <picture> (AVIF → WebP → PNG en repli).
//
// IMPORTANT : <picture> choisit la <source> selon le TYPE supporté, pas selon le succès du
// chargement. Une variante manquante casse l'image (aucun repli sur le <img>). Ce script doit donc
// couvrir TOUS les PNG servis via <Picture> — d'où le parcours exhaustif de public/img.
//
// Le script émet aussi lib/image-manifest.json (chemin public → dimensions intrinsèques). <Picture>
// s'en sert pour poser width/height : le navigateur réserve alors la place avant le chargement, ce
// qui supprime le CLS — sans dimensions codées à la main sur 44 images.
//
// Usage : npm run img:optimize   (idempotent : ne réencode que si le PNG est plus récent)
import { readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = "public/img";
const MANIFEST = "lib/image-manifest.json";

// "public/img/modules/x.png" (séparateurs OS) → "/img/modules/x.png" (chemin servi = clé du manifeste)
const publicPath = (p) => `/${p.replace(/\\/g, "/").replace(/^public\//, "")}`;

// Photos plein cadre (dégradés doux, aucun texte) → compression un peu plus poussée. Le reste, ce
// sont des captures d'UI avec du texte : qualité plus haute pour éviter les artefacts de lisibilité.
const PHOTOS = new Set(["feat-photo-filled.png", "hero-photo.png", "hero-office.png"]);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(dir, e.name))
      : extname(e.name).toLowerCase() === ".png"
        ? [join(dir, e.name)]
        : [],
  );

const fresh = (src, out) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

const files = walk(ROOT).sort();
const manifest = {};
let png = 0;
let webp = 0;
let avif = 0;
let made = 0;

for (const src of files) {
  const stem = src.slice(0, -4);
  const photo = PHOTOS.has(basename(src));
  // Un canal alpha inutile gonfle l'encodage : on aplatit quand l'image est opaque.
  const { isOpaque } = await sharp(src).stats();
  const { width, height } = await sharp(src).metadata();
  manifest[publicPath(src)] = { w: width, h: height };
  const base = () => (isOpaque ? sharp(src).flatten() : sharp(src));

  const outWebp = `${stem}.webp`;
  const outAvif = `${stem}.avif`;
  if (!fresh(src, outWebp)) {
    await base()
      .webp({ quality: photo ? 82 : 90, effort: 6 })
      .toFile(outWebp);
    made++;
  }
  if (!fresh(src, outAvif)) {
    await base()
      .avif({ quality: photo ? 62 : 72, effort: 4 })
      .toFile(outAvif);
    made++;
  }

  png += statSync(src).size;
  webp += statSync(outWebp).size;
  avif += statSync(outAvif).size;
}

// `files` est trié : les clés du manifeste le sont aussi → diff stable d'un run à l'autre.
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;
const pct = (n) => `-${(100 - (n / png) * 100).toFixed(1)}%`;
console.log(`[img] ${files.length} PNG · ${made} variante(s) (ré)encodée(s)`);
console.log(`[img] png=${mb(png)}  webp=${mb(webp)} (${pct(webp)})  avif=${mb(avif)} (${pct(avif)})`);
console.log(`[img] ${MANIFEST} · ${Object.keys(manifest).length} entrées de dimensions`);
