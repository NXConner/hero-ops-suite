# Next Steps

Focus next on data, persistence, and exports to reach production-readiness:

- Supabase integration
  - Auth/roles, RLS policies, schema for users, business profile, price book, jobs, customers
  - Migration from localStorage to cloud with conflict resolution UI

- Estimator and Accounting
  - Implement leg-based fuel costing and sales tax jurisdiction expansions
  - Branded PDF invoices (logo, terms, signatures) and email/share flow
  - CSV import mapping with preview/validation

- Maps and Telemetry
  - Real employee tracking storage/queries; shifts; geofence CRUD/events and notifications
  - AI: segmentation mask → vector polygons; store outlines and attach to projects/jobs
  - Routing provider keys and regional bias; caching and offline fallbacks

- QA/CI and Observability
  - Unit tests for pricing/import/invoices/gps/route/geofence events
  - E2E for OverWatch tools and builder flows; CI with lint/typecheck/test/build
  - Sentry and performance budgets

- UX/Perf polish
  - Mobile-friendly controls, clustering/heatmaps, saved layer presets, accessibility

- Environment & configuration
  - Provide `VITE_WEATHER_API_KEY` in `.env.local` (already supported) and secure secrets in CI/CD.
  - Consider adding provider keys for maps and telemetry as needed.

- Mobile Companion web export
  - Keep `public/mobile/` in sync: `cd mobile && npx expo export --platform web --output-dir ../public/mobile`.
  - Add a CI step to build/export mobile web on release.

- Replace dev fallbacks
  - Replace `/suite/` and `/suite/fleet/` dev placeholders by integrating the actual sub-app builds or embedding the live apps during development.

- Auth hardening
  - Add auth gating across web + mobile, token storage improvements (httpOnly cookies), and session persistence.

Provide required env keys at runtime/build and add wallpaper/video assets to `public/` as needed.