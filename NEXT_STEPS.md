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

Provide required env keys at runtime/build and add wallpaper/video assets to `public/` as needed.