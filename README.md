# Mobile 3D Asphalt Assessment Platform

This repository contains:

- `supabase/`: SQL schema, policies, and seeds for the backend (Postgres/Supabase).
- `mobile/`: React Native (Expo) mobile app skeleton with overlay handling, cost estimator, PDF report, and a stub 3D viewer.

## Quick start

### Backend (Supabase)
1. Create a Supabase project.
2. Run the SQL from `supabase/schema.sql` and `supabase/seed/cost_tables.sql`.
3. Configure Storage buckets: `meshes/`, `raw_images/`, `snapshots/`, `tiles/`, `reports/`.
4. Set RLS policies per `schema.sql` and create service role key for server-side jobs if needed.

### Mobile app (Expo)
1. Install dependencies:
   - `cd mobile`
   - `npm install`
2. Configure environment variables in `mobile/src/config/index.ts`:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optional API base.
3. Run in development:
   - `npm run start`

## Modules
- Overlay schema (single source of truth) in `mobile/src/types/overlay.ts`.
- API client and offline queue in `mobile/src/services/`.
- Estimator and PDF generation in `mobile/src/utils/`.
- 3D viewer stub in `mobile/src/components/OverlayViewer3D.tsx`.

## Next steps
- Hook device capture to your preferred scanning app exporter (GLB/GLTF/OBJ).
- Wire cloud analysis service to produce overlay JSON, then upload via `POST /scans/{id}/overlay`.
- Flesh out 3D viewer using `expo-three` and GLTF loading.
- Add portals and analytics as web apps or within a monorepo structure.
