# RouteSphere Control Tower — System Architecture

> Version: 2.0.0 | Last Updated: 2026-06-20

---

## 1. System Overview

RouteSphere is an independent enterprise last-mile delivery execution platform consisting of:

| Component | Technology | Status |
|-----------|-----------|--------|
| Control Tower | React 18 + TypeScript + Vite 5 | ✅ Live |
| AI Command Center | Rule-based intelligence engine | ✅ Live |
| Returns Dashboard (10E) | Recharts + Zustand | ✅ Live |
| Rider Intelligence (10F) | Recharts + Zustand | ✅ Live |
| Driver App | Expo SDK 54 / React Native | ✅ Preview |

---

## 2. Frontend Architecture

```
Browser
  └── React 18 (SPA — served via Vercel)
        ├── React Router v6 (23 routes, SPA rewrites via vercel.json)
        ├── Zustand (global state)
        │     ├── liveDataStore — real-time event + KPI store
        │     └── filterStore   — dashboard filters
        ├── Dashboards (23 files in src/dashboards/)
        ├── Components (layout, LiveEventFeed, LiveKPIBar)
        └── AI Engine (src/data/aiCommandCenterData.ts)
```

---

## 3. Real-Time Data Architecture

```
[Production Target]
Delivery App  ──►  REST/WS API  ──►  Backend  ──►  WebSocket  ──►  Control Tower

[Current Prototype]
setInterval engine (liveDataStore.ts)
  │
  ├── generateEvent() — weighted random (13 event types)
  ├── applyEventToKPIs() — pure function, merges event into 16 KPI counters
  └── Zustand store — pushEvent → all subscribed dashboards re-render
```

### Live Engine Parameters

| Parameter | Default | Range |
|-----------|---------|-------|
| Poll interval | 3s | 1s – 10s (or pause) |
| Events per tick | 1-3 | Weighted random |
| Max events stored | 200 | Ring buffer |
| Event types | 13 | delivery_completed, sos_alert, etc. |

### Event Type Weights

| Event Type | Weight | Notes |
|-----------|--------|-------|
| delivery_completed | 35 | Highest frequency |
| delivery_failed | 8 | |
| pickup_started | 12 | |
| return_picked_up | 8 | Phase 10E |
| return_hub_received | 5 | |
| return_reconciled | 5 | |
| incentive_triggered | 6 | Phase 10F |
| penalty_applied | 3 | |
| rating_received | 8 | |
| rider_status_change | 6 | |
| sos_alert | 0.5 | Critical, rare |
| shift_started | 4 | |
| shift_ended | 2 | |

---

## 4. AI Command Center Architecture

```
liveDataStore (KPIs + Events)
  │
  └── computeAIState() — src/data/aiCommandCenterData.ts
        ├── computeRisks()       → 7 rule-based risk detectors
        ├── computeInsights()    → 6 operational insight generators
        ├── computeSuggestions() → 7 optimization suggestion generators
        └── computeForecasts()   → 4 predictive signals
              │
              └── AICommandCenter.tsx (4-tab dashboard)
                    ├── Risk Intelligence tab
                    ├── Operational Insights tab
                    ├── Optimization Suggestions tab
                    └── Forecast tab
```

**AI constraint:** Advisory-only. Cannot modify orders, payouts, reconciliation, or system state.

**Recompute trigger:** Every 5 live engine ticks AND on `kpis.openSosAlerts` or `kpis.deliveriesFailed` change.

**Production swap:** Each `compute*()` function can be replaced with an API call returning the same typed interface from a real inference service without changing any UI code.

---

## 5. Deployment Architecture

```
Developer Machine
  │
  ├── git push origin main
  │       │
  │       ▼
  │   GitHub (shashankzodeofficial/RouteSphere)
  │       │
  │       ├── GitHub Actions: ci.yml (TypeScript + Vite build check)
  │       ├── GitHub Actions: release.yml (on vX.X.X tag → ZIP archive → GitHub Release)
  │       └── Vercel Webhook (auto-triggered on main push)
  │               │
  │               ▼
  │           Vercel Build (Washington DC - iad1)
  │               • npm ci
  │               • tsc && vite build
  │               • Output: dist/ (~975 KB gzipped: ~254 KB)
  │               │
  │               ▼
  │           Production: https://routesphere-control-tower.vercel.app
  │
  └── npx expo start --tunnel
          │
          ▼
      Expo Go (iOS) via tunnel: exp://rgnk47u-anonymous-8081.exp.direct
```

---

## 6. Route Map (23 Routes)

| Path | Dashboard | Module |
|------|-----------|--------|
| `/` | Live Delivery Tracking | Core |
| `/riders` | Rider Tracking | Core |
| `/success-rate` | Success Rate | Core |
| `/attempt-rate` | Attempt Rate | Core |
| `/exceptions` | Exceptions | Core |
| `/cod` | COD Collection | Core |
| `/pod` | POD Dashboard | Core |
| `/hubs` | Hub Dashboard | Core |
| `/sla` | SLA Dashboard | Core |
| `/routes` | Route Performance | Core |
| `/performance` | Performance | Rider Dev |
| `/supervisor` | Supervisor View | Rider Dev |
| `/coaching` | Coaching Center | Rider Dev |
| `/recognition` | Recognition Hub | Rider Dev |
| `/learning` | Learning Center | Rider Dev |
| `/incentives` | Incentive Engine | Rider Dev |
| `/safety` | Safety Dashboard | Rider Dev |
| `/attendance` | Attendance | Rider Dev |
| `/returns` | Returns Dashboard | Phase 10E |
| `/rider-intelligence` | Rider Intelligence | Phase 10F |
| `/data-flow` | Data Flow & Sync | Infrastructure |
| `/ai-command` | AI Command Center | Phase 11 |

---

## 7. Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| State management | Zustand | Minimal boilerplate, selector-based subscription |
| Real-time simulation | setInterval weighted events | No backend needed for prototype |
| AI engine | Rule-based deterministic | Fully explainable, zero latency, production-swappable |
| Deployment | Vercel auto-deploy | Zero-config, SPA routing, GitHub integration |
| TypeScript | Strict mode | Catches payload `unknown` typing errors at compile time |
| Charts | Recharts | React-native, good TypeScript support |

See `DECISIONS_LOG.md` (project governance) for full decision audit trail.

---

## 8. Known Constraints (Prototype)

| Constraint | Limitation | Production Fix |
|-----------|-----------|---------------|
| Real-time data | Synthetic events, no backend | Connect WebSocket client in liveDataStore |
| AI engine | Rule-based thresholds | Replace compute*() with inference API calls |
| Expo tunnel | Session-scoped URL | Use Expo EAS + TestFlight for permanent URL |
| Authentication | None | Add Clerk/Auth0 + RBAC middleware |
| Data persistence | In-memory only | Connect PostgreSQL via Supabase/PlanetScale |

---

*Last updated: 2026-06-20 | RouteSphere Control Tower v2.0.0*
