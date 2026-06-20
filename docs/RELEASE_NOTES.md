# RouteSphere Control Tower — Release Notes

> Versions are tagged as `vX.Y.Z` in GitHub. Each tag triggers an automated GitHub Release with a ZIP archive.

---

## [v2.0.0] — 2026-06-20 — AI Command Center + DevOps Foundation

### What's New

**AI Command Center** (`/ai-command`)
- 4-tab intelligence dashboard: Risk Intelligence, Operational Insights, Optimization Suggestions, Forecast
- 7 risk detectors: failure rate threshold, SOS alerts, return spikes, SLA/capacity breach, hub congestion, rider rating decline, penalty volume
- 6 operational insight generators: bottleneck hub, performance gap, delay cluster, reconciliation backlog, shift capacity, incentive cost efficiency
- 7 optimization suggestions: rider reallocation, incentive calibration, route rerouting, pickup rescheduling, penalty audit, shift stagger, hub staff deployment
- 4 predictive forecasts: next-day delivery load, rider demand, return rate, peak congestion (time-of-day aware)
- Advisory-only — cannot modify system state

**DevOps & Release Engineering**
- GitHub Actions CI pipeline (`ci.yml`): TypeScript + Vite build verification on every push
- GitHub Actions release pipeline (`release.yml`): ZIP archive + GitHub Release on version tag
- GitHub Actions docs gate (`docs-check.yml`): Required documentation presence check
- `docs/` folder added to repository: ARCHITECTURE.md, RECOVERY_GUIDE.md, SETUP_GUIDE.md, RELEASE_NOTES.md
- Git release tagging system active (semantic versioning: vX.Y.Z)

### Modules Changed

| Module | Change |
|--------|--------|
| `src/data/aiCommandCenterData.ts` | New — AI intelligence engine |
| `src/dashboards/AICommandCenter.tsx` | New — 4-tab AI dashboard |
| `src/App.tsx` | Route `/ai-command` added (23 total routes) |
| `src/components/layout/Sidebar.tsx` | AI Command Center nav item added |
| `.github/workflows/` | 3 GitHub Actions workflows created |
| `docs/` | 4 documentation files created |

### Deployment Status

| Environment | URL | Status |
|-------------|-----|--------|
| Production | https://routesphere-control-tower.vercel.app | ✅ Live |
| AI Command Center | https://routesphere-control-tower.vercel.app/ai-command | ✅ Live |

---

## [v1.1.0] — 2026-06-20 — TypeScript Fix + GitHub/Vercel Auto-Deploy

### What's New
- Fixed TypeScript strict-mode errors in `LiveEventFeed.tsx` (payload `unknown` type narrowing)
- GitHub repository connected: https://github.com/shashankzodeofficial/RouteSphere
- Vercel project created and auto-deploy activated: every `git push origin main` → production deploy
- `vercel.json` SPA routing rewrite rule (`/(.*) → /index.html`)
- Expo iOS tunnel sharing: `exp://rgnk47u-anonymous-8081.exp.direct`

### Modules Changed
- `src/components/LiveEventFeed.tsx` — payload rendering ternary fix
- `.gitignore` — Node/Vite/Vercel exclusions
- `vercel.json` — SPA routing + build config

---

## [v1.0.0] — 2026-06-20 — Initial Control Tower Release

### What's New

**Phase 10E — Reverse Logistics**
- Returns Dashboard with full lifecycle tracking (pickup → hub → reconciliation)
- Return status timeline, pickup failure analysis, reconciliation KPIs
- Live data merge from event stream

**Phase 10F — Rider Intelligence**
- Rider Intelligence Dashboard: 7 KPI cards, earnings trend, performance score distribution
- Hub earnings breakdown, fleet RadarChart, rating distribution, badge leaderboard, top 10 table
- Incentive Engine, Safety Dashboard, Attendance tracking, Coaching Center, Learning Center

**Real-Time Sync Layer**
- `liveDataStore.ts`: Zustand store with 13 event types, weighted random generator, 16 KPI counters
- `LiveEventFeed.tsx`: Fixed-position event ticker with speed controls (1–10s/pause), filters, SOS highlighting
- `LiveKPIBar.tsx`: Persistent top-of-page 11-KPI bar with sync indicator
- `DataFlowDiagram.tsx`: 5-layer architecture visualization + poll controls

**Core Dashboards (10 operations modules)**
- Live Delivery Tracking, Rider Tracking, Success Rate, Attempt Rate, Exceptions
- COD Collection, POD Dashboard, Hub Dashboard, SLA Dashboard, Route Performance

**Rider Development Suite (8 modules)**
- Performance Dashboard, Supervisor View, Coaching Center, Recognition Hub
- Learning Center, Incentive Engine, Safety Dashboard, Attendance Dashboard

### Technical Foundation
- React 18 + TypeScript strict mode + Vite 5
- Zustand for state management, React Router v6 for 22 routes
- Recharts for all data visualizations
- Vercel auto-deploy, GitHub source of truth

---

*All releases are tagged in GitHub and available at:*
*https://github.com/shashankzodeofficial/RouteSphere/releases*
