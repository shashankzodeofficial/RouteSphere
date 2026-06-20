# RouteSphere Control Tower — Setup Guide

> For new machines, new contributors, or post-recovery setup
> Version: 2.0.0 | Last Updated: 2026-06-20

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.x (LTS) | via NVM — `nvm install 20` |
| npm | 10.x | bundled with Node |
| Git | 2.x | https://git-scm.com |
| GitHub CLI | 2.x | `winget install --id GitHub.cli` (Windows) |
| Vercel CLI | 54.x | `npm install -g vercel` |

---

## Quick Start (60 seconds)

```bash
git clone https://github.com/shashankzodeofficial/RouteSphere.git
cd RouteSphere
npm install
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
RouteSphere/                     ← GitHub repo root (Control Tower source)
├── .github/
│   └── workflows/
│       ├── ci.yml               ← Build + TS check on every push
│       ├── release.yml          ← GitHub Release on version tag push
│       └── docs-check.yml      ← Documentation gate check
├── docs/
│   ├── ARCHITECTURE.md          ← System architecture
│   ├── RECOVERY_GUIDE.md        ← Disaster recovery procedures
│   ├── RELEASE_NOTES.md         ← Version-by-version release notes
│   └── SETUP_GUIDE.md           ← This file
├── src/
│   ├── App.tsx                  ← 23 routes + live engine bootstrap
│   ├── components/
│   │   ├── layout/              ← Sidebar, Header, FilterBar
│   │   ├── LiveEventFeed.tsx    ← Real-time event ticker
│   │   └── LiveKPIBar.tsx       ← Top KPI bar
│   ├── dashboards/              ← 23 dashboard files
│   │   ├── AICommandCenter.tsx  ← AI intelligence layer
│   │   ├── LiveDeliveryTracking.tsx
│   │   ├── ReturnsDashboard.tsx
│   │   ├── RiderIntelligenceDashboard.tsx
│   │   └── ...
│   ├── data/                    ← Mock data + AI engine
│   │   └── aiCommandCenterData.ts
│   ├── store/
│   │   ├── liveDataStore.ts     ← Zustand real-time store (13 event types)
│   │   └── filterStore.ts
│   ├── styles/                  ← CSS
│   └── types/                   ← TypeScript type definitions
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json                  ← SPA routing + build config
```

---

## Available Scripts

```bash
npm run dev       # Start local dev server (http://localhost:3000)
npm run build     # TypeScript check + Vite production build → dist/
npm run preview   # Serve dist/ locally
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 18.x |
| Language | TypeScript | 5.x (strict mode) |
| Build Tool | Vite | 5.x |
| State Management | Zustand | 4.x |
| Routing | React Router | v6 |
| Charts | Recharts | 2.x |
| Icons | Lucide React | latest |
| Deployment | Vercel | auto-deploy on push to main |
| CSS | Plain CSS + inline styles | — |

---

## Deployment

### Auto-deploy (standard workflow)

```bash
git add -A
git commit -m "feat: your change description"
git push origin main
# Vercel builds and deploys automatically in ~60 seconds
```

### Manual Vercel deploy

```bash
vercel login
vercel deploy --prod --scope supply-chain-builders
```

---

## Creating a Release

```bash
git tag v2.1.0
git push origin v2.1.0
# GitHub Actions: build → zip archive → GitHub Release published automatically
```

Tag format: `v{major}.{minor}.{patch}`

---

## Branch Strategy

| Branch | Purpose | Auto-Deploy |
|--------|---------|-------------|
| `main` | Production — always deployable | Vercel Production |
| `feature/*` | Development work | Vercel Preview URL |

```bash
git checkout -b feature/my-new-feature
# ... develop ...
git push origin feature/my-new-feature
# Vercel creates a preview URL automatically
# Merge to main when validated
```

---

## Key URLs

| Resource | URL |
|----------|-----|
| Production | https://routesphere-control-tower.vercel.app |
| GitHub Repo | https://github.com/shashankzodeofficial/RouteSphere |
| Vercel Dashboard | https://vercel.com/supply-chain-builders/routesphere-control-tower |
| GitHub Actions | https://github.com/shashankzodeofficial/RouteSphere/actions |
| GitHub Releases | https://github.com/shashankzodeofficial/RouteSphere/releases |

---

*Last updated: 2026-06-20 | RouteSphere DevOps Engineering*
