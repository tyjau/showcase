/**
 * No-flash theme boot. Runs before paint on the static export and sets the
 * `.dark` class on <html> synchronously (no flash, no hydration mismatch —
 * server markup is neutral). Default is DARK (handoff: dark-by-default): a
 * first-time visitor with no stored choice gets dark; un choix explicite
 * 'light' reste light ; 'system' suit l'OS.
 *
 * Server Component : rendu tel quel dans le <head> de chaque coquille <html>
 * (app/[lang]/layout.tsx et app/not-found.tsx). Le script est une constante
 * littérale — aucune entrée utilisateur — donc `dangerouslySetInnerHTML` est sûr.
 */
export function ThemeBootScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          "(function(){try{var t=localStorage.getItem('skyrh.theme');var d=t==='dark'||!t||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();",
      }}
    />
  );
}
