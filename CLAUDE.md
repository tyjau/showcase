# Showcase — règles pour agents

Showcase est le site public de SkyRH : vitrine, inscription self-service, espace client (consommation,
factures, Stripe, parrainage, MFA, support), espace partenaire. Next 15 en export statique, React 19,
Vitest, Playwright + axe. Il ne parle qu'à Guardian (`auth.php`) et renvoie vers le front par `/sso`.
Vue d'ensemble et état du projet : dépôt `skyrh-docs` (`architecture/vue-ensemble.md`, `products/showcase.md`).
Ce fichier fait foi ; `AGENTS.md` y renvoie.

## Toute évolution part d'une spec
- Un lot significatif part d'une spec `skyrh-docs/specs/F-xxxx-<slug>/spec.md` (règles : `skyrh-docs/CONVENTIONS.md`).
- Réserver un numéro : dans `skyrh-docs`, `node tools/gen-features.mjs --next`, copier `specs/_modele/spec.md`,
  puis committer et pousser la spec SEULE — c'est le push qui réserve. Une implémentation qui diverge met la spec à jour d'abord.

## Portes
- Avant de pousser : `npm run lint`, `npx tsc --noEmit`, `npm test` (ce que joue `ci.yml`), et `npm run test:e2e`,
  qui n'est pas en CI. Le déploiement part sur tag sans tests : le filet est local.
- Commit par pathspec (`git commit -- <fichiers>`), jamais de `--no-verify`.

## Contrat de config (deployment-config rework)

La forge `scripts/forge-config.mjs` lit la config du snapshot via `cfg.<clé>`. La liste de ces clés
est le CONTRAT du front, matérialisé dans `deploy/config-keys.json` — **généré depuis la source,
jamais édité à la main** (calque de `db-catalog.json` côté back).

➡️ Si tu ajoutes/retires un `cfg.X` dans la forge, **lance `npm run gen:config-keys`** puis committe
`deploy/config-keys.json`. Sinon la CI (`gen-config-keys.mjs --check`) rougit. Guardian consomme ce
contrat pour vérifier, au publish, que le `config_json` autorisé porte bien toutes les clés requises.
