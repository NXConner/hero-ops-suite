# Mobile 3D Asphalt Assessment Platform

This repository contains:

- `supabase/`: SQL schema, policies, and seeds for the backend (Postgres/Supabase).
- `mobile/`: React Native (Expo) mobile app skeleton with overlay handling, cost estimator, PDF report, and a stub 3D viewer.
- `odoo/asphalt-odoo-prime`: Integrated sub-application (Operations Suite) built and served under `/suite/` in production.

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
2. Configure API base (default points to local server):
   - Edit `mobile/src/config/index.ts` if needed.
3. Run in development:
   - `npm run start`

### Local API server (dev)
1. `cd server && npm install`
2. `npm start` (starts on http://localhost:3001)
3. Mobile app uses this base to call endpoints like `/scans`, `/scans/{id}/overlay`.

### Integrated Odoo Suite sub-app
- In production Docker build, the sub-app from `odoo/asphalt-odoo-prime` is built and served at `/suite/`.
- Inside the main UI, navigate to `Operations Suite` in the sidebar (route `/operations-suite`) to view it embedded.
- For local development, run the sub-app separately with `cd odoo/asphalt-odoo-prime && npm i && npm run dev` and open it on its dev port.

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
