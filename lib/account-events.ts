/**
 * Événement d'ouverture d'onglet du portail compte.
 *
 * POURQUOI IL EXISTE. Le menu avatar pointe des liens de type `/<lang>/account#invoices`,
 * `#payment`, `#referrals`. Depuis une AUTRE page, le portail se monte et lit le hash : l'onglet
 * s'ouvre. Mais lorsqu'on est DÉJÀ sur /account, la navigation ne remonte pas le composant et ne
 * change que le fragment — l'onglet ne bougeait donc pas, et le clic paraissait mort. C'est ce qui
 * rendait notamment le programme de parrainage introuvable une fois connecté.
 *
 * On ne peut pas se reposer sur le seul `hashchange` : l'App Router met à jour l'URL via
 * l'historique, ce qui n'émet pas toujours cet événement. Le menu signale donc explicitement son
 * clic, et le portail écoute LES DEUX (cet événement + `hashchange`, qui couvre les accès directs,
 * favoris et boutons précédent/suivant).
 */
export const ACCOUNT_TAB_EVENT = "skyrh:account-tab";

/** Signale au portail qu'un lien d'onglet vient d'être cliqué (après mise à jour de l'URL). */
export function notifyAccountTab(): void {
  if (typeof window === "undefined") return;
  // Un tour de boucle : l'App Router doit avoir écrit le nouveau hash avant qu'on le relise.
  requestAnimationFrame(() => window.dispatchEvent(new Event(ACCOUNT_TAB_EVENT)));
}
