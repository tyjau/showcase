# Plan d'implémentation — Refonte handoff SkyRH (100 % de la promesse)

> ✅ **TERMINÉ — les 7 lots L0→L6 sont livrés, production-ready.** DoD handoff couverte à 100 %
> (seule adaptation assumée : Légal en routes path + alias plutôt qu'onglets-hash, sous le routing
> hybride). Portes : `tsc` 0 · **unit 61/61** · **e2e** (chrome/home/pricing/contact/legal/careers/
> status/enterprise/account/onboarding/qa/a11y) · **build export prod OK** (210 fichiers, `.htaccess` livré).
>
> **Suivis traités** : ✅ **Contraste marque RÉSOLU** — accent accessible (`--brand-sky-strong` pour les fonds
> à texte blanc, `--sky-text` flippant pour le texte ; #0F9ED5 gardé pour identité/déco ; co-brand préservé).
> **AA strict 18/18** (9 écrans × clair/sombre, color-contrast inclus). ✅ **lucide-react@1.18.0** confirmé
> légitime (latest=1.21.0 ; icônes de marque retirées par Lucide → SVG inline). Tickets restants :
> `request_demo` (rebuild PHAR guardian) · migration Next 15 (breaking).

> Référence de suivi des lots. Source de vérité du design : le bundle handoff
> (`design_handoff_skyrh_site/`, 14 maquettes `.dc.html` + screenshots). Ce plan traduit
> sa « Définition de terminé » en lots livrables, chacun fermé par une **double barrière**
> (tests Vitest/Playwright + **diff visuel vs maquette**).

## État du socle (déjà en place — NE PAS refaire)
Tokens `globals.css` = table du handoff au près · **Mulish** chargé · toggle thème no-flash ·
providers devise/langue · `SiteHeader`/`SiteFooter` partagés · provider co-brand (`brandSky`
surchargeable) · `SocialProof` · lib catalogue/prix · **tests unitaires** (Vitest, 41 tests, CI).

## Décisions verrouillées
1. **Routing hybride** : ajouter les pages réellement manquantes, garder les noms qui marchent.
2. **Thème sombre forcé par défaut** (1ʳᵉ visite = dark, puis togglable + persisté).
3. **Back des pages neuves : tranché lot par lot** (à L4). Contact codé front-first avec une
   couture propre pour un futur endpoint ; Statut/Carrières statiques par défaut.
4. **E2E + revue visuelle sur Laragon LIVE** ; matrice de captures **complète**
   (FR/EN × clair/sombre × desktop/mobile). Un seul harnais Playwright = e2e + génération captures.

## Carte de routes (hybride)
| | Route | Action |
|---|---|---|
| 🔴 Neuf | `/contact` (`?sujet=`), `/status`, `/careers` | créer |
| 🟠 Upgrade en place | `/`, `/pricing`, `/features` + `/features/[module]` (gabarit détail hi-fi, Paie réf.), `/platform`, `/company` (contenu Entreprise), `/resources` (vrai hub), `/account`, `/signup` | monter en hi-fi |
| ✅ Gardé | `/login`, `/partner*`, `/become-partner`, `/legal/[doc]` (path conservé + alias des liens `#terms/#privacy/#security`) | — |

> Seule entorse assumée au DoD littéral : Légal en routes **path** + aliasing des liens entrants,
> plutôt qu'onglets-par-hash. Mini-lot séparé si les onglets-hash exacts sont exigés.

## Ordre d'implémentation : L0 → L1 → L2 → L3 → L4 → L5 → L6
Rationale : L0 = barrière de vérif + baseline ; L1 (chrome) partagé par tous les écrans ;
L2 (Home) invente les patterns réutilisés (hero/carousel/packs) → dé-risqué tôt ;
L3 réutilise la bande packs ; L4 réutilise chrome+patterns ; L5 (écrans app, couplés back) après ;
L6 (QA + durcissement) en dernier, a besoin de tout.

| Lot | Contenu | Gate (tests + visuel) | DoD | Statut |
|---|---|---|---|---|
| **L0** | Playwright/Laragon + comptes seedés, scaffolding 3 routes neuves, **baseline captures** | 128 captures OK, routes 200, logins validés | (3) | ✅ fait |
| **L1** | Header 1123px + « Essai gratuit » toujours visible, footer 4/3/2 (880/600), **dark défaut** ; burger porte Devise/Langue/Thème/Se connecter. (Parallax → reporté en L2 avec le hero.) | e2e chrome **4/4** ✓ + captures 1440/1000/700/420 ✓ ; unit 41/41 | (1)(2) | ✅ fait |
| **L2** | Home **complète** : hero photo+parallax+preview · grille features **liée** (Paie→module) + photo latérale ≤894 · **carousel** modules (autoplay 6s/pause/dots/flèches) · **bande packs** (catalogue+devise, noms FR depuis dict → évite le bug données) · CTA **réassurances** | unit `wrapIndex` (4) ; e2e home **3/3** (lien/carousel/packs) ; diff 01-Home dark/light/mobile ✓ | (4) | ✅ fait |
| **L3** | Tarifs : **bug données corrigé** (couche i18n `packageText` + retrait du résumé anglais) · onglet **Comparatif** (matrice modules×plans) · **hero parallax** · curseur mobile + a11y | unit `packageText` ×3 ; e2e pricing **4/4** ; diff 03-Tarifs ✓ | (4-packs)(5)(10) | ✅ fait |
| **L4** | ✅ **/careers** (filtre équipe) · ✅ **/status** (pastilles, titre dynamique) · ✅ Partenaires CTA→/become-partner · ✅ **/contact** (form+`?sujet=`+validation+sent ; endpoint guardian `request_demo` ajouté en **source**, activable au rebuild PHAR) · ✅ Légal onglets **en tête** (aria-current) · ✅ Features/Help hero **parallax** · ✅ gabarit **détail module** (hero photo+parallax + dashboard + galerie captures Paie) · ✅ **bug 404 corrigé** (carte Paie → vrai code `WAGE-GEN00`) · ✅ **/enterprise** (offre Sur devis · Cloud/Sur site/Autonome · bénéfices) + nav recâblée (« Entreprise »→/enterprise, « À propos »→/company footer) | unit `jobs` ×5 ; e2e l4-pages 3/3 + contact 4/4 + legal 2/2 + module 1/1 + enterprise 2/2 ; diff 06/08/09/10/11/12 ✓ | (3)(6)(7) | ✅ fait |
| **L5** | ✅ prérequis (login partenaire + harnais authentifié mocké) · ✅ **Compte** refondu : **sidebar** groupée + onglet **Offre & abonnement** (chips état · offre actuelle · **staging modules** → barre « non enregistré » + recalcul live) + entête **« Mon espace Harmony »** · ✅ **Onboarding** : wizard (CGU déjà présent, gate vérifié) + **bascule login** ajoutée (SSO mock vit sur /login) | unit `plan-staging` ×3 ; e2e l5-account 2/2 + l5-onboarding **2/2** (stepper/CGU gate/login) ; diff 13/14 ✓ | (8)(9) | ✅ fait |
| **L6** | ✅ **a11y AA** (axe 18/18, seul résidu = contraste marque #0F9ED5 documenté) · ✅ **zéro overflow 360/1440** (bug /help corrigé) · ✅ crawler **zéro lien mort** + **icônes sociales** (ajoutées, externes, SVG inline car lucide n'a plus les marques) · ✅ reduced-motion (parallax+carousel) · ✅ **M1** (validateurs co-brand) · ✅ **M2** (CSP+headers `public/.htaccess`, livré via postbuild) · ✅ **H2** (déjà dernier 14.2.x ; 15.x = ticket breaking séparé) · ✅ **build export prod OK** (210 fichiers) | e2e l6-qa 4/4 + l6-a11y 18/18 ; unit `cobrand` ×5 ; build ✓ | (1)(3)+durcissement | ✅ fait |

## Définition de terminé (handoff) — mapping
(1) Chrome partagé responsive → L1 · (2) thème/devise/langue providers → L0-L1 · (3) 14 routes
câblées zéro lien mort → L0+L4+L6 · (4) Home hi-fi → L2 · (5) Tarifs interactif → L3 ·
(6) Légal (adapté path+alias) → L4 · (7) Contact → L4 · (8) Onboarding → L5 · (9) Compte staging → L5 ·
(10) bug données packages → L3 · (11) reduced-motion/AA/overflow → L6.

## Bugs — statut
- ✅ **Login partenaire** corrigé (L5) : `apiLoginPartner` envoie `company=<NEXT_PUBLIC_PARTNER_COMPANY|skyrh>` (guardian exige `company` même pour scope=partner). Test unit ajouté.
- ✅ **Harnais authentifié** : « Chargement… » diagnostiqué = backend **PHAR dev se bloque en concurrence** (1 req=200, 4 concurrentes=timeout) — pas un bug front/prod. Captures authentifiées **mockées** (déterministes). Account + Partner rendent correctement.

## Bugs (historique)
- 🐛 **Login partenaire cassé** (trouvé en L0) : `apiLoginPartner` (lib/api.ts) poste `c=login`
  **sans `company`**, mais guardian exige `?company=` pour l'action `login` (routes/src/auth.php:275
  → 400 « Missing company »). Avec `company=skyrh` (société plateforme) le login partenaire répond
  200 + referrer. **Fix à décider** : front envoie `company=<plateforme>` (ex. `NEXT_PUBLIC_PARTNER_COMPANY`)
  **ou** back rend `company` optionnel quand `scope=partner` (intent du handoff = « partenaire sans workspace »).
  Bloque le parcours partenaire de L5.

## Dépendances & risques
- **Comptes de test provisionnés** (L0, base live skyrh_auth, creds dans `tests/e2e/.auth/accounts.ts`, gitignoré) :
  tenant `owner@pf2.test` / workspace `pf2` (login billing **validé 200**) ; partenaire `e2e.partner@skyrh.test`
  lié au referrer actif `ACME` (login **validé 200 avec company=skyrh**, cf. bug ci-dessus).
- **Assets** : hero/feature = illustrations remplaçables ; captures Paie = réelles ; logos clients/partenaires = placeholders à fournir.
- **Décision back L4** : endpoint contact (`request_demo`, rate-limité comme `signup_request`) ?
- **Effort** : L2/L4/L5 sont les plus lourds (plusieurs jours chacun).
