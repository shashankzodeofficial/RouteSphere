# RouteSphere Control Tower — Disaster Recovery Guide

> **Recovery Objective:** Full ecosystem restoration within one working day
> **Last Updated:** 2026-06-20 | Version: 2.0.0

---

## 1. Recovery Scenarios

| Scenario | Estimated Recovery Time | Difficulty |
|----------|------------------------|------------|
| Laptop failure — Control Tower only | 15 minutes | Easy |
| Laptop failure — full ecosystem | 60–90 minutes | Medium |
| Vercel deployment failure | 5 minutes | Easy |
| Expo Metro session lost | 2 minutes | Easy |
| GitHub remote unavailable | Use local backup archive | Medium |

---

## 2. Prerequisites (Install Once on New Machine)

```bash
# Node.js via NVM (recommended)
# Windows: Download from https://github.com/coreybutler/nvm-windows/releases
nvm install 20
nvm use 20

# Verify
node --version   # should be v20.x.x
npm --version

# GitHub CLI
# Windows: winget install --id GitHub.cli
gh --version

# Vercel CLI
npm install -g vercel

# Expo CLI
npm install -g expo-cli
```

---

## 3. Recover the Control Tower (Vercel + GitHub)

### Step 1 — Clone repository

```bash
git clone https://github.com/shashankzodeofficial/RouteSphere.git
cd RouteSphere
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Run local development server

```bash
npm run dev
# Control Tower available at: http://localhost:3000
```

### Step 4 — Verify TypeScript

```bash
npx tsc --noEmit
# Expected output: 0 errors
```

### Step 5 — Verify production build

```bash
npm run build
# Expected: dist/ folder created, no errors
```

### Step 6 — Deploy to Vercel (if needed)

```bash
vercel login          # device-flow OAuth, no password stored
vercel deploy --prod --scope supply-chain-builders
```

Auto-deploy is active: every `git push origin main` triggers Vercel automatically.

---

## 4. Recover Expo iOS App (RouteSpherePreview)

> Repository: Stored locally at `C:\rs\RouteSpherePreview`
> Note: This project is NOT yet pushed to GitHub. Recover from local backup if available.

```bash
cd C:\rs\RouteSpherePreview
npm install
npx expo start --tunnel
```

If local backup is unavailable, rebuild from the Expo SDK 54 template and re-apply RouteSpherePreview source files from the most recent backup archive.

**iOS Tester access after recovery:**
- New tunnel URL is generated each session
- Share the new `exp://...exp.direct` URL with testers
- Or scan QR code from terminal output

---

## 5. GitHub Authentication Recovery

```bash
gh auth login
# Select: GitHub.com → HTTPS → Login with a web browser
# Complete device-flow OAuth at https://github.com/login/device
```

---

## 6. Vercel Authentication Recovery

```bash
vercel login
# Opens browser → authenticate with GitHub SSO under supply-chain-builders team
```

---

## 7. Environment Variables

No environment variables are required for the current prototype — all data is mock/in-memory.

For future production configuration:
```
VITE_API_BASE_URL=https://api.routesphere.io/v1
VITE_WS_URL=wss://ws.routesphere.io/events
```

Add in Vercel Dashboard → Project Settings → Environment Variables.

---

## 8. Live Production URLs

| System | URL | Status Check |
|--------|-----|-------------|
| Control Tower (Production) | https://routesphere-control-tower.vercel.app | `curl -o /dev/null -w "%{http_code}" URL` |
| AI Command Center | https://routesphere-control-tower.vercel.app/ai-command | Same |
| Returns Dashboard | https://routesphere-control-tower.vercel.app/returns | Same |
| Rider Intelligence | https://routesphere-control-tower.vercel.app/rider-intelligence | Same |
| GitHub Repository | https://github.com/shashankzodeofficial/RouteSphere | |
| Vercel Dashboard | https://vercel.com/supply-chain-builders/routesphere-control-tower | |

---

## 9. Backup Archive Structure

Each release backup ZIP contains:

```
YYYY-MM-DD-vX.X.X-routesphere-control-tower.zip
├── dist/               ← Production build output
├── src/                ← All source files
├── docs/               ← Recovery, architecture, setup guides
├── public/             ← Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

Archives are created automatically by the GitHub Actions release workflow when a version tag is pushed.

---

## 10. Verify Recovery Complete

After recovery, confirm all these pass:

```bash
# 1. Local dev running
curl http://localhost:3000/                    # → 200

# 2. All 23 routes accessible
curl http://localhost:3000/ai-command          # → 200
curl http://localhost:3000/returns             # → 200
curl http://localhost:3000/rider-intelligence  # → 200

# 3. TypeScript clean
npx tsc --noEmit                              # → 0 errors

# 4. Production build succeeds
npm run build                                 # → dist/ created

# 5. Vercel production live
curl https://routesphere-control-tower.vercel.app/ai-command  # → 200
```

All five checks passing = full recovery confirmed.

---

*Maintained by: RouteSphere DevOps & Release Engineering*
*Recovery owner: shashankzodeofficial@gmail.com*
