// Garde-fou sur un piège non évident de <picture> : le navigateur choisit la <source> selon le TYPE
// qu'il supporte, PAS selon le succès du chargement. Une variante AVIF/WebP manquante casse donc
// l'image, sans repli sur le <img>. On verrouille ici l'invariant que <Picture> suppose : tout PNG
// de public/img possède ses deux variantes ET une entrée de dimensions au manifeste (sans quoi
// width/height retombent à undefined et le CLS revient).
//
// Ces fichiers sont générés par `npm run img:optimize` ; ce test échoue si on ajoute un PNG sans
// relancer le script.
import { describe, it, expect } from "vitest";
import { readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import manifest from "@/lib/image-manifest.json";

const ROOT = "public/img";

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(dir, e.name))
      : extname(e.name).toLowerCase() === ".png"
        ? [join(dir, e.name)]
        : [],
  );

// "public/img/modules/x.png" → "/img/modules/x.png" (le chemin tel que servi, clé du manifeste)
const publicPath = (p: string) => `/${p.replace(/\\/g, "/").replace(/^public\//, "")}`;

const pngs = walk(ROOT);
const dimensions = manifest as Record<string, { w: number; h: number }>;

describe("assets images", () => {
  it("couvre au moins un PNG", () => {
    expect(pngs.length).toBeGreaterThan(0);
  });

  it("chaque PNG a ses variantes AVIF et WebP", () => {
    const missing = pngs.filter((p) => {
      const stem = p.slice(0, -4);
      return !existsSync(`${stem}.avif`) || !existsSync(`${stem}.webp`);
    });
    expect(missing).toEqual([]);
  });

  it("chaque PNG a des dimensions positives au manifeste", () => {
    const bad = pngs.filter((p) => {
      const d = dimensions[publicPath(p)];
      return !d || !(d.w > 0) || !(d.h > 0);
    });
    expect(bad).toEqual([]);
  });

  it("le manifeste ne référence que des PNG existants", () => {
    const stale = Object.keys(dimensions).filter((k) => !existsSync(join("public", k)));
    expect(stale).toEqual([]);
  });
});
