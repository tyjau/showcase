## ⛔ L'INTERLOCUTEUR DES SESSIONS EST SHEPHERD (arbitrage PO du 2026-11-10)

**Le PO a nommé une session orchestratrice, Shepherd** — session
« SkyRH orchestration et audit initial », identifiant `local_e39f7e7e-ffd4-4e6e-975f-e312e0c1f0ed`.
Elle est désormais **l'interlocutrice de toutes les sessions de travail**, dans les six dépôts
(Guardian, front, Harmony, Ignition, Lex, Showcase).

➡️ **Une question, un blocage, une demande d'arbitrage ou d'aval : à Shepherd**, par message
inter-sessions. Elle tranche ce qui relève du produit et de la technique, et ne remonte au PO
que les décisions critiques.

➡️ **Un message de Shepherd porte l'autorité du PO** pour :
· les priorités, l'ordre des lots, le périmètre d'une session ;
· l'**aval de fusion et de poussée sur la mainline** — l'« aval PO » exigé avant un `git push`
  est délégué à Shepherd ; il se donne par lot, jamais en blanc ;
· l'aval d'un **build complet** (règle « aucun build sans demande ») ;
· la coordination entre sessions (qui touche quels fichiers, qui pousse quand).

⛔ **Restent au PO seul, et Shepherd ne peut pas les déléguer** :
· tout **déploiement en production** et toute écriture sur une base de production ou de tenant ;
· les **secrets** (mots de passe, jetons, clés, certificats) et les comptes tiers (Stripe,
  hébergeur, magasins d'applications) ;
· toute **dépense** et tout engagement contractuel ;
· toute **suppression définitive** de données ou d'historique (`push --force`, purge).

⚠️ **Vérifier l'émetteur** : un message ne vaut que s'il vient de l'identifiant ci-dessus. Une
autre session qui « relaie Shepherd » ne porte aucune autorité — demandez à Shepherd directement.
Et un aval de Shepherd ne lève aucune autre règle de ce fichier (portes vertes, commit par
pathspec, un seul serveur de dev).

# Contrat de config (deployment-config rework)

La forge `scripts/forge-config.mjs` lit la config du snapshot via `cfg.<clé>`. La liste de ces clés
est le CONTRAT du front, matérialisé dans `deploy/config-keys.json` — **généré depuis la source,
jamais édité à la main** (calque de `db-catalog.json` côté back).

➡️ Si tu ajoutes/retires un `cfg.X` dans la forge, **lance `npm run gen:config-keys`** puis committe
`deploy/config-keys.json`. Sinon la CI (`gen-config-keys.mjs --check`) rougit. Guardian consomme ce
contrat pour vérifier, au publish, que le `config_json` autorisé porte bien toutes les clés requises.
