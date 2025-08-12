# Getting Started

Prereqs: Node 20+, npm 10+

1. Copy env: `cp .env.example .env`
2. Install: `npm ci`
3. Dev server: `npm run dev`
4. Tests: `npm test -- --run`
5. Lint/format: `npm run lint` / `npm run format`

Docker (prod build):
- `docker compose up --build`
- App available at http://localhost:8080

Load test (k6):
- `k6 run loadtest/k6-smoke.js` (set `TARGET_URL`)