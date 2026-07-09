/**
 * Données structurées (JSON-LD) injectées dans le DOM. Server Component : rendu statiquement dans
 * l'export, zéro coût client. `data` est un graphe schema.org construit côté serveur depuis nos
 * dictionnaires / le catalogue — jamais d'entrée utilisateur, donc `dangerouslySetInnerHTML` est sûr.
 */
export function JsonLd({ data }: { data: object }) {
  // Échappe « < » (→ <) : aucune valeur ne peut ainsi fermer la balise <script>. Défense en
  // profondeur — le contenu vient de nos dictionnaires/catalogue, mais c'est la pratique standard JSON-LD.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
