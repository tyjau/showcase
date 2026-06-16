# Co-branded funnel — plan & hand-off

**But** : transformer le funnel public en **funnel d'acquisition co-brandé par partenaire**
(croissance *reseller-led*). Un revendeur partage `…/{lang}/signup?partner_code=X` (ou `?ref=X`) ;
le funnel se **thème à sa marque**, **attribue** le signup au partenaire, et **price selon le
`billing_unit` configuré**. **Fallback** marque SkyRH + catalogue baké si pas de partenaire →
les prospects directs continuent de marcher.

> Statut : démarré par Claude sur la branche `feat/cobrand-funnel`. Showcase peut **prendre la main**.

## Contrat backend (côté fondateur — à exposer)
```
GET /auth.php?c=partner_config&code=<code>     (public, comme ?c=catalog)
→ data: {
    brand_name, logo_url | logo_b64, primary_color, secondary_color,
    domain,                       // suffixe de succès, ex. "acme.skyrh.app"
    products: ["skyrh", ...],
    pricing?: {                   // override wholesale optionnel
      billing_unit: "per_employee" | "per_company" | "tiered_caps",
      packages: [...], modules: [...]   // sinon → catalogue par défaut
    }
  }
// code absent/invalide → 404/empty → le front bascule sur le fallback.
```
Le back accepte **déjà** `referral_code` sur `signup_request` (referrers/referrals, migr. 112) ;
le front doit **commencer à l'envoyer**.

## Changements front (branche `feat/cobrand-funnel`)
1. `lib/partner.ts` — fetch **runtime** de `partner_config` (+ types + fallback). ⚠️ runtime, car le
   catalogue actuel est **baké au build** (`lib/catalog.ts` + `force-cache`).
2. `components/partner-provider.tsx` — lit `?partner_code`/`?ref` de l'URL, fetch le config, le fournit (calqué sur `currency-provider`).
3. **Theming** : variables CSS pilotées par les couleurs partenaire ; `BrandLogo` dynamique (logo partenaire ou SkyRH).
4. `signup-wizard.tsx` :
   - envoyer `referral_code` (= partner_code/ref) + **UTM** (utm_source/campaign/medium) dans le POST `signup_request`.
   - **prix selon `billing_unit`** : aujourd'hui hardcodé per-employee (`rate × employees`, l.352/453) → brancher sur l'unité configurée.
   - **domaine succès** : utiliser `domain` du partenaire au lieu du `.skyrh.app` en dur (l.215, 389, 460).
5. **Prix wholesale** : si `partner_config.pricing` présent, l'utiliser au lieu du catalogue baké.

## Checklist
- [x] `lib/partner.ts` (fetch runtime `partner_config` + fallback)
- [x] `partner-provider` + lecture `?partner_code`/`?ref` + UTM
- [x] theming dynamique : `navy`/`sky` en CSS vars (override runtime) + `BrandLogo` dynamique
- [x] wizard : attribution (`referral_code` + UTM dans `signup_request`)
- [x] wizard : prix selon `billing_unit` (per_employee ✓ · per_company flat ✓ · tiered_caps = TODO bandes)
- [x] domaine succès partenaire (`domainBase`)
- [ ] **RESTE — override catalogue wholesale** (`partner_config.pricing.packages/modules`) : per_company/tiered ont besoin des **prix flat fournis par le back**. Aujourd'hui per_employee est pleinement correct ; per_company affiche le total depuis `rate` (placeholder tant que les prix wholesale ne sont pas câblés).
- [ ] **Backend (fondateur)** : exposer `GET /auth.php?c=partner_config&code=`.
- [ ] **Vérif visuelle/e2e** : nécessite le back `partner_config` + un code partenaire.

Voir aussi `PRICING_NOTE.md` (la règle de prix configurable).
