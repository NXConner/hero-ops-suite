# Mobile 3D Asphalt Assessment Platform

This repository contains:

- `supabase/`: SQL schema, policies, and seeds for the backend (Postgres/Supabase).
- `mobile/`: React Native (Expo) mobile app skeleton with overlay handling, cost estimator, PDF report, and a stub 3D viewer.
- `odoo/asphalt-odoo-prime`: Integrated sub-application (Fleet & Field Ops) built and served under `/suite/` in production. Access via main route `/fleet-field-ops`.
- `suite/fleet-focus-manager`: Integrated Fleet Focus Manager sub-app, served under `/suite/fleet/` and accessible within Fleet & Field Ops.
- `suite/asphalt-atlas-hub`: Integrated Asphalt Atlas Hub sub-app, served under `/suite/atlas/`.
- `suite/patrick-county-mapper`: Integrated Patrick County Mapper sub-app, served under `/suite/mapper/`.
- `suite/pave-wise-weather-cast`: Integrated PaveWise Weather Cast sub-app, served under `/suite/weather/`.

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
- Asphalt Atlas Hub (from `suite/asphalt-atlas-hub`) is built and served at `/suite/atlas/`.
- Patrick County Mapper (from `suite/patrick-county-mapper`) is built and served at `/suite/mapper/`.
- PaveWise Weather Cast (from `suite/pave-wise-weather-cast`) is built and served at `/suite/weather/`.
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

## New routes and features

- Builder: `/builder` for page/widget layouts
- Theme Customizer: `/theme-customizer` for live theme edits
- OverWatch Map in-place Edit toggle for widgets

## Settings additions

- Wallpapers: global override, profiles, color filters (hue/brightness), parallax with strength
- Audio: UI sound presets and volume/mute
- Navigation: drag-and-drop with nesting by drop position
- Display: quick Minimal Effects preset buttons and Low Power Mode in sidebar

## UI Tokens

Per-component UI tokens are now supported and persisted in themes:

- Radii: card, button, input/select, menu, popover/dropdown, toast, dialog, tabs
- Borders: border width, focus ring width, focus ring offset

Components are wired to CSS vars, enabling live preview and persistence across reloads.

## Environment

- Set `VITE_WEATHER_API_KEY` in a root `.env.local` to enable live weather data in the OverWatch Weather overlay.
  - Example: `VITE_WEATHER_API_KEY=your_openweather_key`
- Other optional endpoints (GPS/sensors) can be set via corresponding `VITE_*` vars as implemented in `src/services/api.ts`.

## Mobile Companion web build

- The embedded Mobile Companion uses a static web export served from `public/mobile/`.
- To rebuild after changes to the Expo app:
  1. `cd mobile && npm install`
  2. `npx expo export --platform web --output-dir ../public/mobile`
- During development, static fallbacks exist for `/mobile/`, `/suite/`, `/suite/fleet/`, `/suite/atlas/`, `/suite/mapper/`, and `/suite/weather/` to avoid 404s. Production serving is handled by Nginx (see `docker/nginx.conf`).

## Documentation

- State compliance (Virginia and North Carolina): see `docs/STATE_COMPLIANCE.md`.
