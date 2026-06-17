# Contrat de config (deployment-config rework)

La forge `scripts/forge-config.mjs` lit la config du snapshot via `cfg.<clé>`. La liste de ces clés
est le CONTRAT du front, matérialisé dans `deploy/config-keys.json` — **généré depuis la source,
jamais édité à la main** (calque de `db-catalog.json` côté back).

➡️ Si tu ajoutes/retires un `cfg.X` dans la forge, **lance `npm run gen:config-keys`** puis committe
`deploy/config-keys.json`. Sinon la CI (`gen-config-keys.mjs --check`) rougit. Guardian consomme ce
contrat pour vérifier, au publish, que le `config_json` autorisé porte bien toutes les clés requises.
