# What Remains – Project Status and To‑Do

## Completed (current state)

- Business data centralized
  - `BUSINESS_PROFILE` with materials, mix ratios, coverage, pricing, fuel, vehicles, equipment, trailers, travel defaults
  - Types in `src/types/business.ts`
- Estimator core
  - Sealcoating materials from coverage with 20% water and sand bags; Fast‑Dry and Prep‑Seal calculations
  - Crack filling pricing (boxes, propane) and optional deep‑crack sand prefill
  - Patching with thickness (in) and material (hot vs cold) pricing
  - Line striping linear feet + extras (HC symbols, arrows, crosswalk count, stop bars, text stencils) and paint color price deltas
  - Fuel model (C30 + Dakota travel miles, active fuel, excessive idle; MPG degradation under load)
  - Transport load calculation includes unit, sealer (concentrate + water), and sand weights; GVWR advisory
  - Overhead and profit; base variants: +25% markup, rounded‑to‑$10 and rounded +25%
  - Optional sales tax line item placeholder
- UI & UX
  - Estimator page: presets, PMM price control (default/bulk), validation on numeric inputs, weight check toggle
  - Auto miles: business↔supplier and business↔job address (geocode + haversine)
  - Geolocation “Use my location” with reverse geocoding
  - Recent Jobs (save/load) and Address Book (save/use)
  - Invoice preview, copy invoice/copy‑all, Download .txt, Export PDF
  - Jobs/Customers CSV export
- Settings → Business (read/write)
  - Fully editable defaults persisted locally (localStorage overrides)
  - Export/Import all (settings overrides, jobs, customers) as JSON; Reset to defaults
- Infrastructure & libs
  - Geocoding with User‑Agent header, 7‑day TTL caching, retry/backoff
  - Estimator returns typed `EstimateOutput`
  - Minimal unit tests for helper functions (Vitest)
  - Docs updated (`ESTIMATING_GUIDE.md`); README section on business config

## What remains (functional)

- Apply Sales Tax to totals
  - Add per‑job toggle and persist on job; include tax in computed total (not just line item)
- Patching productivity & materials
  - Refine productivity by thickness/material; optional tack coat/additives line items
- Crack filling refinements
  - Propane consumption tied to hours; deep/wide crack detection inputs/templates; hot‑pour temperature/time allowances
- Line striping
  - Detailed stencil catalog (sizes/variants, per‑color material deltas), multi‑color layouts, curb/stop text
- Sealcoating
  - Multi‑coat options; waste factor (%); primer area detection helper; spray vs squeegee productivity presets
- Fuel & transport
  - Trailer‑specific towing MPG adjustments; route legs (supplier→job→return) vs current two‑leg simplification

## What remains (UX)

- Address inputs as structured fields (street/city/state/zip) with autocomplete; route map preview
- Better input validation messages, helper text, and presets (driveway vs lot templates)
- Loading states and error handling for geocoding; manual override confirmation UI

## What remains (data & persistence)

- Cloud sync (Supabase or similar)
  - Auth/roles; migrate local overrides/jobs/customers to cloud
  - Audit/version history for pricing changes and business profile edits

## What remains (exports & invoicing)

- Branded PDF invoices
  - Logo, business name, terms (30‑day), signatures, optional tax line, per‑item notes
  - Email/share workflow (mailto or SMTP/API)
- Import/export conflict resolution UI; CSV column mapping and validation

## What remains (engineering)

- Testing
  - Expand unit tests to all estimator branches and edge cases
  - Add E2E smoke tests for Estimator and Settings (Playwright/Cypress)
- Type safety
  - Remove remaining `any` casts in Estimator page param plumbing; strict typing for UI state
- Performance
  - Code‑split heavy pages/components (3D/maps/exporters) and lazy‑load
  - PWA/offline support for field quoting; caching strategy for geocode and assets
- Ops & monitoring
  - CI/CD with lint, typecheck, tests, build, preview deploys
  - Error monitoring (Sentry) and basic usage analytics on estimator
- Security/compliance
  - Security pass for storage and exports; privacy note for geocoding usage; dependency updates

## To‑Do (actionable)

- Totals & tax
  - [ ] Add per‑job `applySalesTax` flag; compute and include tax in `total`
  - [ ] Persist tax flag in job params; surface in UI and invoice text
- Estimator inputs
  - [ ] Add structured address inputs + geocode autocomplete
  - [ ] Add route map preview (supplier→job→return)
  - [ ] Add preset templates (Driveway / Parking Lot) to prefill relevant fields
- Calculators
  - [ ] Trailer MPG modifiers and leg‑based route fuel costing
  - [ ] Patching: tack coat/additives toggles and productivity curves by thickness
  - [ ] Crack: propane by hours; deep/wide sand prefill factor tuning
  - [ ] Sealcoat: multi‑coat, waste factor, application method productivity
- Striping
  - [ ] Build stencil catalog (sizes, prices, colors) and UI picker
  - [ ] Per‑color material price deltas tied to catalog
- Persistence
  - [ ] Supabase schema for users, business profile, price book, jobs, customers
  - [ ] Migration utility from localStorage; conflict resolution
- Exports
  - [ ] Branded PDF (logo, terms, signatures) and email/share
  - [ ] CSV import with mapping; import preview + validation
- QA & CI
  - [ ] Unit test coverage for all helpers and edge cases
  - [ ] E2E flows for Estimator, Settings, Export/Import
  - [ ] GitHub Actions for lint/typecheck/test/build
- Performance/UX polish
  - [ ] Lazy‑load exporters and geocode libs; PWA support
  - [ ] Geocode throttling UI, spinners, and error toasts
- Security
  - [ ] Add content security policy; review data handling; update dependencies

## Files of interest (implemented)

- `src/types/business.ts` – BusinessProfile and pricing/fuel extensions
- `src/data/business.ts` – Defaults with materials, pricing, fuel, vehicles, equipment
- `src/lib/estimator.ts` – Calculators (materials, fuel, striping, patching, transport, totals)
- `src/lib/geo.ts` – Geocoding with caching, retry, and haversine
- `src/pages/Estimator.tsx` – Estimator UI (all features, exports, validation)
- `src/pages/Settings.tsx` – Business settings (edit, export/import)
- `src/services/*` – business profile overrides, jobs, customers, exporters, export/import bundle
- `src/test/estimator.spec.ts` – Minimal unit tests
- `docs/ESTIMATING_GUIDE.md` – Guide & config pointers

## Quick next steps

1. Implement sales tax in totals with per‑job toggle (UI + calculator)
2. Add stencil catalog and structured address UI with map preview
3. Migrate to Supabase (schema + adapters + migration)
4. Branded PDF invoice and email/share
5. Flesh out unit/E2E tests and wire CI
