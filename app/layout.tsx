import "./globals.css";
// Effet de bord assumé : `next/font` émet ses @font-face et la définition de `--font-mulish` dans le
// chunk CSS de l'entrée qui l'importe. En l'important ICI (layout racine, présent dans les DEUX
// branches), la police atterrit dans la feuille commune ; importée seulement depuis [lang]/layout,
// elle manquait à out/404.html et `font-sans` retombait sur la police par défaut du navigateur (la
// var vide invalide toute la déclaration `font-family`).
import "@/lib/fonts";

/**
 * Root layout — volontairement TRANSPARENT (il rend `children` tel quel, sans <html>/<body>).
 *
 * Pourquoi il existe : Next exige qu'une route ait un layout racine au-dessus d'elle. Toutes nos
 * pages vivent sous `app/[lang]/`, sauf `app/not-found.tsx` (racine, car en `output: export` c'est
 * lui qui produit `out/404.html` — la page 404 référencée par deploy/nginx-showcase.conf.example et
 * public/.htaccess). Sans ce fichier, `next dev` renvoie 500 sur TOUTES les routes :
 * « not-found.tsx doesn't have a root layout ». (`next build` tolérait, d'où le bug passé en CI.)
 *
 * Pourquoi il ne rend PAS <html>/<body> : l'attribut `<html lang>` doit varier par locale, or un
 * layout racine ne connaît pas `params.lang` (le segment [lang] est en dessous de lui). On garde
 * donc DEUX coquilles <html> distinctes sous ce layout — le pattern « multiple root layouts » de
 * Next, ici recollé par un passe-plat :
 *   - app/[lang]/layout.tsx → <html lang={params.lang}> pour tout le site (SEO/hreflang) ;
 *   - app/not-found.tsx     → <html lang="en"> pour la 404 hors-locale (la langue réelle est posée
 *                             côté client, comme le fait le gateway out/index.html).
 * Next valide la présence de <html>/<body> sur le flux HTML rendu, pas sur ce fichier : les deux
 * branches sont donc conformes. `notFound()` appelé depuis une page [lang] remonte à la frontière
 * not-found racine, qui est ICI — le layout [lang] est démonté, aucun <html> imbriqué.
 *
 * Les styles globaux sont importés ici pour couvrir les deux branches en une fois.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
