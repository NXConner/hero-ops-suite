# Mobile 3D Asphalt Assessment Platform

This repository contains:

- `supabase/`: SQL schema, policies, and seeds for the backend (Postgres/Supabase).
- `mobile/`: React Native (Expo) mobile app skeleton with overlay handling, cost estimator, PDF report, and a stub 3D viewer.
- `odoo/asphalt-odoo-prime`: Integrated sub-application (Fleet & Field Ops) built and served under `/suite/` in production. Access via main route `/fleet-field-ops`.
- `suite/fleet-focus-manager`: Integrated Fleet Focus Manager sub-app, served under `/suite/fleet/` and accessible within Fleet & Field Ops.

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

### Integrated sub-apps
- Fleet & Field Ops (from `odoo/asphalt-odoo-prime`) is built and served at `/suite/`.
  - In the main UI, go to `Fleet & Field Ops` (route `/fleet-field-ops`).
  - Within Fleet & Field Ops, you can open Fleet Focus Manager.
- Fleet Focus Manager (from `suite/fleet-focus-manager`) is built and served at `/suite/fleet/`.
  - Accessible inside Fleet & Field Ops or directly at `/suite/fleet/`.
- Mobile Companion (Expo web build) is served at `/mobile/` and embedded at `/mobile-companion`.

## Modules
- Overlay schema (single source of truth) in `mobile/src/types/overlay.ts`.
- API client and offline queue in `mobile/src/services/`.
- Estimator and PDF generation in `mobile/src/utils/`.
- 3D viewer stub in `mobile/src/components/OverlayViewer3D.tsx`.

## Development notes
- API base and auth token are centralized in `src/config/api.ts`.
- Sub-apps receive context (API base, token) via `postMessage` and use a thin API wrapper.
- A shared SDK lives in `packages/platform-sdk` for types and API access.

## Next steps
- Hook device capture to your preferred scanning app exporter (GLB/GLTF/OBJ).
- Wire cloud analysis service to produce overlay JSON, then upload via `POST /scans/{id}/overlay`.
- Flesh out 3D viewer using `expo-three` and GLTF loading.
- Add portals and analytics as web apps or within a monorepo structure.
