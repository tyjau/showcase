# ⚠️ Pricing is CONFIGURABLE — do not hardcode per-employee

Decision 2026-06-15 (platform pricing reconciliation).

The billing unit is a **per-subscription configuration** (`billing_unit`), defaulted from the
plan template and overridable per subscription / per reseller. Possible modes:

- `per_employee` — `unit_amount × headcount` (the current/default mode)
- `per_company`  — flat amount, headcount ignored
- `tiered_caps`  — per-employee with employee-count bands / caps (predictable budget)

## What the showcase funnel MUST do

- **Fetch the pricing mode** (and the per-employee/flat/banded amounts) from the backend
  — via the catalog API and/or `GET /auth.php?c=partner_config&code=<partner>` (co-branded funnels
  may carry partner-specific wholesale prices).
- **Compute & display** the estimated price according to that mode:
  - per_employee → `€X / employee / mo × your N employees = €Y`
  - per_company  → `€Z / mo (flat)`
  - tiered_caps  → show the band for the entered headcount
- **Never** assume per-employee in `lib/catalog.ts` or `components/signup-wizard.tsx`.

## Why

Reseller-led 3-sided model: different partners/clients/tiers may be billed differently.
Hardcoding one mode breaks co-branded reseller funnels and the wholesale price layer
(`subscription_modules.unit_amount → reseller_prices → module_prices`).

See the platform strategy memo for the full model.
