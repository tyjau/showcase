# Passe 2 — audit data-driven (Search Console + funnel GA)

La **passe 1** (audit SEO / conversion / crédibilité, PR #3 et suivantes) était **heuristique** :
faite à la lecture du code, sans données réelles. La **passe 2** la transforme en **pilotage sur
données** — positions/impressions (Google Search Console) + funnel de conversion (GA4). Elle ne peut
démarrer qu'une fois le site **en production** et après **quelques semaines de collecte**.

## Déjà livré (prérequis techniques)

- **Sitemap + robots** générés au build (`scripts/postbuild.mjs`, 110 URLs, préfixés par `SITE_URL`).
- **Canonical / hreflang** par page, **JSON-LD** (Organization, WebSite, FAQPage, Offer, BreadcrumbList),
  **`noindex`** sur les pages auth/utilitaires.
- **Funnel GA4** : `page_view`, `cta_click`, `select_plan`, `sign_up_start`, `sign_up_step`, `sign_up`,
  `generate_lead` (Consent Mode v2, cookieless jusqu'au consentement).
- **Vérification GSC câblée** : `NEXT_PUBLIC_GSC_VERIFICATION` (forge `cfg.gsc_verification`) →
  `<meta name="google-site-verification">`. Émise uniquement si le jeton est posé.

## À faire côté opérateur (compte Google + déploiement)

1. **Déployer sur le domaine public** (skyrh.app) avec `SITE_URL` / `NEXT_PUBLIC_SITE_URL` = ce domaine —
   le sitemap et les canonical en dépendent (sinon ils pointent le staging).
2. **Vérifier le domaine dans Search Console**, au choix :
   - via la **propriété GA4 déjà liée** (aucun code) ; ou
   - poser `gsc_verification = <jeton>` dans le `config_json` (Ignition) → la balise sort au build.
3. **Soumettre le sitemap** dans GSC : `https://skyrh.app/sitemap.xml`.
4. **Lier GA4 ↔ Search Console** (GA4 → Admin → liens Search Console).
5. **Marquer les conversions** dans GA4 : `sign_up` et `generate_lead` (Admin → Événements → marquer
   comme conversion).
6. **Laisser tourner ~2 à 4 semaines** pour un échantillon exploitable.

## Ce que je ferai une fois les données disponibles (le ré-audit)

**SEO (GSC)**
- Requêtes/pages à **impressions élevées mais CTR faible** → titres/meta à retravailler.
- Positions **5–15** (quasi-podium) → quick wins de contenu/maillage.
- Pages à **0 impression** → problème d'indexation/canonical à diagnostiquer.
- **Rich results** (FAQ, Breadcrumb, Offer) → validité + gains d'affichage.

**Conversion (GA4)**
- Taux réels **par étape du wizard** → où ça abandonne vraiment.
- Quel **CTA** convertit (`cta_click` → `sign_up`), quel emplacement.
- **Positionnement** : A/B « SIRH paie multi-pays / OHADA » vs le hero actuel.
- **Double opt-in** : mesurer l'abandon post-`sign_up` (l'angle mort de la passe 1).
- **Sources (UTM)** les plus qualifiées.

**Croisement** : les pages **géo / comparatives** qui rankent *et* convertissent ; OHADA vs Europe.

## Angle mort à garder en tête

L'**activation réelle** (définition du mot de passe, sur le sous-domaine applicatif) reste **invisible
au GA du showcase** : `sign_up` mesure une *demande*, pas l'activation. La vraie conversion se mesure
côté app — à réconcilier (GA cross-domain ou mesure serveur) pour un funnel complet. Voir l'audit de
conversion (passe 1).
