// 404 globale (→ out/404.html en `output: export`). Elle vit à la racine de app/, hors du segment
// [lang] : c'est ce qui garantit `out/404.html` (et pas `out/en/404.html`), le fichier référencé par
// deploy/nginx-showcase.conf.example et public/.htaccess.
//
// Elle porte donc sa PROPRE coquille <html>/<body> : le layout racine est un passe-plat et le layout
// [lang] (qui rend d'ordinaire <html>) n'est pas au-dessus d'elle. Voir app/layout.tsx.
//
// `lang="en"` est statique — un seul 404.html sert toutes les locales — puis NotFoundContent le
// corrige côté client selon la langue du navigateur.
import { mulish } from "@/lib/fonts";
import { NotFoundContent } from "@/components/not-found-content";
import { ThemeBootScript } from "@/components/theme-boot-script";

export default function NotFound() {
  return (
    <html lang="en" className={mulish.variable} suppressHydrationWarning>
      <head>
        <ThemeBootScript />
      </head>
      <body className="font-sans bg-page text-ink antialiased">
        <NotFoundContent />
      </body>
    </html>
  );
}
