# SkyRH — showcase

Site public **vitrine** + **funnel d'inscription self-service** + **espace client (compte & facturation)** +
**espace partenaire**. Next.js 14 (App Router), **export statique** au build, i18n FR/EN, Tailwind.

> C'est ici qu'on construit toute l'UI commerciale (acquisition + portail client), **pas** dans `skyrh-front`
> (l'app RH du tenant, qui ne fait que consommer l'entitlement). Contrat de facturation détaillé :
> `docs/BILLING_PAYMENT.md` (dans le repo `skyrh-front`). Backend = `skyrh-back` (« guardian »).

## Surfaces (`app/[lang]/…`)

| Route | Rôle |
| --- | --- |
| `/` `/features` `/pricing` `/platform` `/partners` `/company` `/resources` `/legal/[doc]` | Vitrine marketing |
| `/signup` → `/signup/confirm` | Funnel self-service (magic link → mot de passe). pay_first **auto-login** sur confirm. |
| `/login` | Connexion portail (workspace + identifiants), `scope=billing` + **login social Google/Microsoft** (mock dev) |
| `/account` | **Espace client à onglets** : Consommation · Factures (+PDF) · Moyen de paiement · Parrainage · Paramètres. Bandeau **pay_first** épinglé ; « Régler » une facture en souffrance (dunning). |
| `/partner` | **Espace partenaire** (referrer) : code + lien partageable, co-brand, métriques, filleuls |

Header : dropdown de compte une fois connecté (masque le CTA « Essai gratuit ») → Mon compte / Factures /
Moyen de paiement / Espace partenaire / Déconnexion.

## Auth & API

- Endpoints publics du backend via `lib/api.ts` (`apiPost`, `apiLogin`, `apiLoginOAuth`, `apiAuthed`).
  Le token portail (JWT `scope=billing`) est dans `localStorage` (refresh-on-401) ; les endpoints du
  portail sont **admin-only** côté backend.
- `apiAuthed` cible `auth.php?c=<action>` : `my_invoices`, `my_consumption`, `my_referrals`,
  `my_invoice_pdf`, `pay_order`/`pay_order_confirm`, `pay_invoice`, `request`/`cancel_account_deletion`, …

## Dév

```bash
npm install
npm run dev        # http://localhost:3000 (Windows : Node 18.x recommandé — Node ≥ 24 fait planter next dev)
```

`.env.local` (dev) :

```
GUARDIAN_URL=https://saas.test:8443         # backend (le cert local doit être de confiance)
NEXT_PUBLIC_API_BASE=https://saas.test:8443 # défaut si absent
NEXT_PUBLIC_APP_DOMAIN=skyrh.app            # sous-domaine workspace (lien « Ouvrir mon espace RH »)
NEXT_PUBLIC_OAUTH_MOCK=1                    # DEV : affiche + active le login social mock (jamais en prod)
CATALOG_API_KEY=…                           # clé publiable scopée (catalogue tarifs)
```

> Login social **mock** : en dev, les boutons Google/Microsoft envoient un token `mock:<email>` ; le backend
> l'accepte si `OAUTH_ALLOW_MOCK=1` (côté `skyrh-back`) et que l'email correspond à un user actif. En prod :
> câbler le vrai SDK Google/MSAL + les client IDs (le flux backend est déjà en place).

## Build & déploiement

```bash
npm run build      # export statique → out/
npm start          # serve out -l 3100
```

Export statique (`output: 'export'` en production), images non optimisées, `trailingSlash: true`.

## i18n

Dictionnaires `dictionaries/{fr,en}.json`, résolus par `lib/dictionaries.ts` ; locales dans `lib/i18n.ts`.
Toute chaîne visible passe par un dictionnaire (pas de texte en dur).
