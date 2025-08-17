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

- Global terminology toggle is now implemented:
  - New `src/contexts/TerminologyContext.tsx` provides a global `terminologyMode` with `useTerminology()`.
  - Wrapped the app in `TerminologyProvider` in `src/App.tsx`.
  - Added Settings > System > Terminology selector (Military / Civilian / Both).
  - OverWatch and overlays/widgets (Fleet, Weather, MapTools, PavementScan3D, Voice UI) now consume the global mode (props remain optional for backward compatibility).

Suggested follow-ups
- Add jest/vitest smoke tests for terminology toggling:
  - Verify Settings selector updates context and persists to localStorage.
  - Ensure OverWatch title and button labels swap as expected.
- Consider persisting per-user server-side in `databaseService` preferences when user id is known.
- Expand terminology coverage to remaining pages where "mission/project" or similar dual terms appear.
- Add a quick-access terminology switcher in the top header for faster context switching during demos.