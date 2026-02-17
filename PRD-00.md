# PRD-00: AKS-Construction Helper App — Bug Fixes & CRA-to-Vite Migration

**Author:** Claude (AI-assisted)
**Date:** 2026-02-17
**Status:** Draft
**Version:** 1.0
**Ralphy Compatible:** Yes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Considerations](#technical-considerations)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Out of Scope](#out-of-scope)
10. [Open Questions & Risks](#open-questions--risks)
11. [Validation Checkpoints](#validation-checkpoints)
12. [Tasks](#tasks)

---

## Executive Summary

The AKS-Construction Helper web app has three categories of issues: a critical bug where the "Generate Scripts" button silently writes files to the wrong directory (one level above the repo root), 12 ESLint warnings from unused variables/imports and code quality issues, and 11+ deprecated npm package warnings all originating from the unmaintained `react-scripts@5.0.1` (Create React App). This PRD addresses all three by fixing the path resolution bug, cleaning up ESLint warnings, and migrating the build tooling from CRA to Vite.

---

## Problem Statement

### Current Situation

The Helper web app (`helper/`) is a React SPA built with Create React App (`react-scripts@5.0.1`). When running the dev server via `scripts/00-predeploy.sh`, three categories of issues manifest:

1. **Generate Scripts button is broken** — Clicking "Generate Scripts" in the Deploy tab shows a success message ("Scripts saved to scripts/ folder") but files are written to `../github/scripts/` instead of `aks-builder/scripts/` due to a path traversal bug in `setupProxy.js` line 6
2. **12 ESLint compile warnings** — Unused imports, loose equality, missing useEffect dependencies, and unnecessary escape characters across 4 component files
3. **11+ deprecated npm packages** — All originating from `react-scripts@5.0.1` transitive dependencies (deprecated Babel proposal plugins, svgo, rollup-plugin-terser, etc.)

### User Impact
- **Who is affected:** Developers using the Helper UI locally to generate deployment scripts
- **How they're affected:** Scripts silently land in the wrong directory — users think generation succeeded but find no files. ESLint warnings clutter the terminal on every compilation. Deprecated packages produce a wall of npm warnings during install.
- **Severity:** Critical (Generate Scripts), Medium (ESLint), Low (npm deprecations)

### Business Impact
- **Cost of problem:** Developer confusion and wasted time debugging "missing" scripts; reduced confidence in the tool
- **Opportunity cost:** CRA is effectively unmaintained — staying on it blocks adoption of modern tooling, faster builds, and ESM-first architecture
- **Strategic importance:** The Helper UI is the primary user-facing tool for AKS-Construction

### Why Solve This Now?
- The Generate Scripts bug makes the core feature of the Deploy tab non-functional for local users
- CRA has been officially deprecated; the React team recommends Vite as the migration path
- ESLint warnings are low-effort fixes that should accompany any refactoring work

---

## Goals & Success Metrics

### Goal 1: Fix Generate Scripts Button
- **Metric:** Scripts appear at `<repo-root>/scripts/01-deploy.sh` and `scripts/02-postdeploy.sh` after clicking button
- **Baseline:** 0 scripts generated (written to wrong path)
- **Target:** 2 scripts generated correctly, every time
- **Timeframe:** Immediate (Phase 1)
- **Measurement:** Manual verification: run dev server, click button, check `scripts/` directory

### Goal 2: Zero ESLint Compile Warnings
- **Metric:** `npm start` compiles with 0 warnings
- **Baseline:** 12 warnings across 4 files
- **Target:** 0 warnings
- **Timeframe:** Phase 2
- **Measurement:** Run `npm start` and verify "Compiled successfully" with no warning block

### Goal 3: Zero Deprecated npm Warnings
- **Metric:** `npm install` produces 0 deprecation warnings
- **Baseline:** 11+ deprecated package warnings
- **Target:** 0 deprecation warnings
- **Timeframe:** Phase 3 (Vite migration)
- **Measurement:** Run `rm -rf node_modules && npm install` and verify clean output

---

## User Stories

### Story 1: Developer Generates Deployment Scripts

**As a** developer using the Helper UI locally,
**I want to** click "Generate Scripts" and have the scripts appear in the repo's `scripts/` folder,
**So that I can** use them to deploy my AKS cluster.

**Acceptance Criteria:**
- Clicking "Generate Scripts" writes `01-deploy.sh` and `02-postdeploy.sh` to `<repo-root>/scripts/`
- Generated `.sh` files have executable permissions (chmod 755)
- A green success message bar appears confirming the save location
- If the scripts/ directory doesn't exist, it is created automatically

**Dependencies:** None

### Story 2: Developer Sees Clean Compilation

**As a** developer running the Helper app locally,
**I want to** see "Compiled successfully" with no warnings,
**So that I can** focus on my work without being distracted by noise.

**Acceptance Criteria:**
- `npm start` compiles with zero ESLint warnings
- No unused variables or imports remain in component files
- All equality comparisons use strict equality (`===`)
- React Hook dependency arrays are correct or intentionally suppressed

**Dependencies:** None

### Story 3: Developer Installs Dependencies Without Deprecation Noise

**As a** developer setting up the project,
**I want** `npm install` to run without deprecation warnings,
**So that I can** have confidence in the project's dependency health.

**Acceptance Criteria:**
- `npm install` produces zero "npm warn deprecated" messages
- Build tooling uses Vite (actively maintained) instead of CRA (deprecated)
- Dev server still runs on port 3000 at `/AKS-Construction/`
- All existing Playwright tests pass against the Vite-built app
- CI workflows updated to use new env var naming (`VITE_*` instead of `REACT_APP_*`)

**Dependencies:** REQ-001 must be merged first (setupProxy path fix is incorporated into Vite config)

---

## Functional Requirements

### Must Have (P0) — Critical for Launch

#### REQ-001: Fix setupProxy.js Path Resolution

**Description:** The `saveToProject()` dev server API writes scripts to the wrong directory because `setupProxy.js` line 6 uses three `..` traversals from `helper/src/` instead of two.

**Root Cause:**
```
// File: helper/src/setupProxy.js (line 6)
// __dirname = helper/src/
const scriptsDir = path.resolve(__dirname, '..', '..', '..', 'scripts');
//                                          ↑      ↑      ↑
//                                       helper/ aks-builder/ github/  ← WRONG
// Resolves to: /home/stana/repos/github/scripts/ (OUTSIDE repo)
// Should be:   /home/stana/repos/github/aks-builder/scripts/
```

**Fix:** Change to `path.resolve(__dirname, '..', '..', 'scripts')` (two `..` levels).

**Acceptance Criteria:**
- `path.resolve` resolves to `<repo-root>/scripts/` (verified by console.log)
- Write operations wrapped in try/catch with error response
- Scripts appear in correct directory after clicking "Generate Scripts"

**Dependencies:** None

#### REQ-002: Fix ESLint Warnings — Unused Variables and Imports

**Description:** Remove unused variables and imports across 4 component files to achieve zero-warning compilation.

**Specific Changes:**

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| `addonsTab.js` | 8-9 | Unused `osmFeatureFlag`, `wiFeatureFlag` | Delete both lines |
| `clusterTab.js` | 15 | Unused `addons` in destructuring | Remove from destructuring |
| `clusterTab.js` | 227 | `==` should be `===` | Change to strict equality |
| `deployTab.js` | 18 | Unused `agw` (used only in commented-out code) | Delete variable (and dead code block) |
| `portalnav.js` | 3 | Unused imports: Toggle, TooltipHost, Modal, IconButton | Remove from import |
| `portalnav.js` | 5 | Unused `mergeStyles` | Remove from import |
| `portalnav.js` | 139 | useEffect missing `urlParams` dep | Add `eslint-disable-next-line` (intentional one-time mount effect) |
| `portalnav.js` | 262 | Unnecessary `\/` escape in string | Remove backslashes |

**Acceptance Criteria:**
- `npm start` shows "Compiled successfully" with zero warnings
- Existing Playwright tests pass without regression

**Dependencies:** None (parallel with REQ-001)

### Should Have (P1) — Important

#### REQ-003: Migrate from Create React App to Vite

**Description:** Replace `react-scripts@5.0.1` with Vite to eliminate all deprecated transitive dependencies, improve build speed, and adopt actively maintained tooling.

**Acceptance Criteria:**
- `npm install` produces zero deprecation warnings
- Dev server runs on port 3000 at `/AKS-Construction/`
- `npm run build` outputs to `helper/build/` (CI compatibility)
- All `process.env.REACT_APP_*` references migrated to `import.meta.env.VITE_*`
- `setupProxy.js` functionality ported to Vite server middleware plugin in `vite.config.js`
- All Playwright tests pass
- CI workflows updated for new env var naming

**Dependencies:** REQ-001 (path fix logic must be incorporated into Vite config)

---

## Non-Functional Requirements

### Performance
- **Dev server cold start:** < 3 seconds (Vite's ESM-based dev server is significantly faster than CRA's webpack)
- **Production build time:** < 30 seconds (comparable or faster than CRA)
- **Hot Module Replacement:** < 500ms for single-file changes

### Compatibility
- **Browsers:** Chrome, Firefox, Safari, Edge (last 2 versions) — matching existing `browserslist`
- **Node.js:** 18+ (current LTS)
- **FluentUI:** v8 (`@fluentui/react ^8.125.4`) — verified compatible with Vite

### Build Output
- Output directory: `helper/build/` (not Vite's default `dist/`) for CI compatibility
- Base path: `/AKS-Construction/` for GitHub Pages deployment

---

## Technical Considerations

### Phase 1 Architecture (Path Fix)

Single file change in `helper/src/setupProxy.js`:
- Fix `path.resolve` from 3 to 2 `..` levels
- Add try/catch around `fs.writeFileSync` for error visibility
- Add `console.log` for scriptsDir to aid future debugging

### Phase 3 Architecture (Vite Migration)

**Key migration points:**

1. **Package changes:** Remove `react-scripts`, `@babel/plugin-proposal-private-property-in-object`. Add `vite`, `@vitejs/plugin-react`.

2. **Config file:** New `helper/vite.config.js` with:
   - `base: '/AKS-Construction/'`
   - `server.port: 3000`, `server.open: false`
   - `build.outDir: 'build'`
   - Custom `saveScriptPlugin()` (replaces `setupProxy.js`)

3. **Entry point:** Move `public/index.html` to `helper/index.html`, add `<script type="module" src="/src/index.jsx">`, remove `%PUBLIC_URL%` placeholders.

4. **JSX file extensions:** Rename 9 `.js` files containing JSX to `.jsx` (Vite requirement).

5. **Environment variables:** Replace `process.env.REACT_APP_*` with `import.meta.env.VITE_*` in 3 files (index.js, portalnav.js, deployTab.js).

6. **CI workflows:** Update env var names in `ghpagesTest.yml`, `release.yml`, `release-soft.yml`.

7. **Cleanup:** Delete `setupProxy.js`, `reportWebVitals.js`. Remove `homepage`, `browserslist`, `eslintConfig`, `overrides` from `package.json`.

### Files Modified Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `helper/src/setupProxy.js` | Fix path + add error handling |
| 2 | `helper/src/components/addonsTab.js` | Remove unused vars |
| 2 | `helper/src/components/clusterTab.js` | Remove unused var, fix `==` |
| 2 | `helper/src/components/deployTab.js` | Remove unused var + dead code |
| 2 | `helper/src/components/portalnav.js` | Clean imports, fix deps, fix escape |
| 3 | `helper/package.json` | Replace CRA with Vite; update scripts |
| 3 | `helper/vite.config.js` | **NEW** — Vite config + save-script plugin |
| 3 | `helper/index.html` | **MOVED** from public/; add module script |
| 3 | `helper/src/*.js` -> `*.jsx` | Rename 9 files |
| 3 | `helper/src/index.jsx` | Migrate env vars; remove reportWebVitals |
| 3 | `helper/src/components/portalnav.jsx` | Migrate env var |
| 3 | `helper/src/components/deployTab.jsx` | Migrate env vars (3 refs) |
| 3 | `helper/src/setupProxy.js` | **DELETE** (moved to vite.config.js) |
| 3 | `helper/src/reportWebVitals.js` | **DELETE** |
| 3 | `scripts/00-predeploy.sh` | Remove `BROWSER=none` prefix |
| 3 | `.github/workflows/ghpagesTest.yml` | Rename env vars |
| 3 | `.github/workflows/release.yml` | Rename env vars |
| 3 | `.github/workflows/release-soft.yml` | Rename env vars |

---

## Implementation Roadmap

### Phase 1: Fix Generate Scripts Button (P0 Critical)

**Goal:** Make the "Generate Scripts" button write files to the correct `scripts/` directory.

- [ ] Fix path resolution in `helper/src/setupProxy.js` line 6: change `'..', '..', '..'` to `'..', '..'` (REQ-001)
- [ ] Add try/catch error handling around `fs.writeFileSync` in `setupProxy.js` (REQ-001)
- [ ] Add console.log for scriptsDir path to aid debugging (REQ-001)
- [ ] Manually test: start dev server, click "Generate Scripts", verify files in `scripts/` (REQ-001)
- [ ] Clean up erroneous `../github/scripts/` directory if it exists from previous runs (REQ-001)

**Validation Checkpoint:** Scripts appear at `<repo-root>/scripts/01-deploy.sh` and `02-postdeploy.sh`

### Phase 2: Fix ESLint Warnings (P0)

**Goal:** Achieve zero-warning compilation.

- [ ] Remove unused `osmFeatureFlag` and `wiFeatureFlag` from `addonsTab.js` lines 8-9 (REQ-002)
- [ ] Remove unused `addons` from destructuring in `clusterTab.js` line 15 (REQ-002)
- [ ] Change `==` to `===` in `clusterTab.js` line 227 (REQ-002)
- [ ] Remove unused `agw` variable and commented-out dead code block in `deployTab.js` (REQ-002)
- [ ] Remove unused imports (Toggle, TooltipHost, Modal, IconButton) from `portalnav.js` line 3 (REQ-002)
- [ ] Remove unused `mergeStyles` import from `portalnav.js` line 5 (REQ-002)
- [ ] Add `eslint-disable-next-line react-hooks/exhaustive-deps` before `portalnav.js` line 139 (REQ-002)
- [ ] Remove unnecessary `\/` escape characters in `portalnav.js` line 262 (REQ-002)
- [ ] Verify `npm start` compiles with zero warnings (REQ-002)
- [ ] Run full Playwright test suite to confirm no regressions (REQ-002)

**Validation Checkpoint:** `npm start` shows "Compiled successfully" with no warnings; all Playwright tests pass

### Phase 3: Migrate CRA to Vite (P1)

**Goal:** Replace Create React App with Vite, eliminating all deprecated npm packages.

- [ ] Install Vite and @vitejs/plugin-react; remove react-scripts and @babel/plugin-proposal-private-property-in-object from `package.json` (REQ-003)
- [ ] Update `package.json` scripts: start -> `vite`, build -> `vite build`, preview -> `vite preview`; remove homepage, browserslist, eslintConfig, overrides sections (REQ-003)
- [ ] Create `helper/vite.config.js` with base path, port 3000, build output to `build/`, react plugin, and saveScriptPlugin middleware (REQ-003)
- [ ] Move `helper/public/index.html` to `helper/index.html`; remove `%PUBLIC_URL%` placeholders; add `<script type="module" src="/src/index.jsx">` (REQ-003)
- [ ] Rename 9 JSX-containing `.js` files to `.jsx`: index, App, portalnav, deployTab, addonsTab, clusterTab, networkTab, common, previewDialog (REQ-003)
- [ ] Migrate `process.env.REACT_APP_APPINSIGHTS_KEY` to `import.meta.env.VITE_APPINSIGHTS_KEY` in `index.jsx` (REQ-003)
- [ ] Migrate `process.env.REACT_APP_TEMPLATERELEASE` to `import.meta.env.VITE_TEMPLATERELEASE` in `portalnav.jsx` and `deployTab.jsx` (3 references total) (REQ-003)
- [ ] Delete `helper/src/setupProxy.js` (functionality moved to vite.config.js plugin) (REQ-003)
- [ ] Delete `helper/src/reportWebVitals.js` and remove its import/call from `index.jsx` (REQ-003)
- [ ] Update `scripts/00-predeploy.sh` line 56: remove `BROWSER=none` prefix (Vite config handles this) (REQ-003)
- [ ] Update CI workflow `ghpagesTest.yml`: rename `REACT_APP_TEMPLATERELEASE` to `VITE_TEMPLATERELEASE` (REQ-003)
- [ ] Update CI workflow `release.yml`: rename both `REACT_APP_*` env vars to `VITE_*` (REQ-003)
- [ ] Update CI workflow `release-soft.yml`: rename both `REACT_APP_*` env vars to `VITE_*` (REQ-003)
- [ ] Run `rm -rf node_modules package-lock.json && npm install` — verify zero deprecation warnings (REQ-003)
- [ ] Run `npm run build` — verify production build succeeds and outputs to `helper/build/` (REQ-003)
- [ ] Start dev server with `npm start` — verify app loads at `http://localhost:3000/AKS-Construction/` (REQ-003)
- [ ] Test "Generate Scripts" button via Vite dev server middleware (REQ-003)
- [ ] Run full Playwright test suite against Vite dev server (REQ-003)

**Validation Checkpoint:** Zero npm warnings; dev server works on port 3000; all Playwright tests pass; CI workflows updated

---

## Out of Scope

1. **Upgrading FluentUI to v9** — FluentUI v8 is compatible with Vite; a UI framework migration is a separate, larger effort
2. **Adding new Playwright tests** — Only existing tests need to pass; new test coverage is out of scope
3. **Migrating to TypeScript** — Would be a natural next step after Vite but is a separate PRD
4. **Fixing GitHub Pages deployment** — The blob download fallback for production works separately; this PRD focuses on local dev experience
5. **Adding ESLint as a standalone tool** — CRA bundles ESLint; Vite does not. Standalone ESLint setup is deferred

---

## Open Questions & Risks

### Risks & Mitigation

| Risk | Likelihood | Impact | Severity | Mitigation | Contingency |
|------|------------|--------|----------|------------|-------------|
| FluentUI CSS-in-JS incompatible with Vite | Low | High | **Medium** | FluentUI v8 is ESM-compatible; verified in community reports | Fallback: configure Vite's `optimizeDeps.include` for FluentUI packages |
| Vite extension resolution breaks extensionless imports | Medium | Medium | **Medium** | Vite resolves .js/.jsx/.ts/.tsx by default | Add explicit extensions to imports if needed |
| CI pipelines break on env var rename | Medium | High | **High** | Update all 3 workflows in same PR | Revert merge commit; env var renames are atomic |
| Playwright tests fail under Vite dev server | Low | Medium | **Medium** | Vite serves same SPA on same port/path | Debug individual test failures; Vite's dev server is standards-compliant |

---

## Validation Checkpoints

### Checkpoint 1: After Phase 1 (Generate Scripts Fix)
**Criteria:**
- [ ] Running `scripts/00-predeploy.sh`, clicking "Generate Scripts" creates files in `<repo-root>/scripts/`
- [ ] Generated files are executable (755 permissions)
- [ ] Console shows correct scriptsDir path

**If Failed:** Check path.resolve output; verify setupProxy.js is being loaded by CRA

### Checkpoint 2: After Phase 2 (ESLint Cleanup)
**Criteria:**
- [ ] `npm start` shows "Compiled successfully" with zero warnings
- [ ] All Playwright tests pass: `npx playwright test --browser chromium .playwrighttests/ --reporter list`

**If Failed:** Review ESLint warning output; ensure no functional code was removed

### Checkpoint 3: After Phase 3 (Vite Migration)
**Criteria:**
- [ ] `npm install` produces zero deprecation warnings
- [ ] `npm run build` succeeds with output in `helper/build/`
- [ ] Dev server runs at `http://localhost:3000/AKS-Construction/`
- [ ] "Generate Scripts" works via Vite middleware
- [ ] All Playwright tests pass
- [ ] No `react-scripts` in `package.json`

**If Failed:** Git revert the Vite migration branch; CRA version remains functional on main

---

## Tasks

> **Ralphy Format**: All tasks below use `- [ ]` at column 1. Ralphy parses these with `grep '^\- \[ \]'`.
> Section headers provide context but are ignored by Ralphy's parser.

### Phase 1: Fix Generate Scripts Button

- [ ] Fix path resolution in `helper/src/setupProxy.js` line 6: change three `..` to two `..` so scripts write to `<repo-root>/scripts/` (REQ-001)
- [ ] Add try/catch error handling around `fs.writeFileSync` in `setupProxy.js` with proper error response (REQ-001)
- [ ] Add console.log for resolved scriptsDir path in `setupProxy.js` for debugging (REQ-001)
- [ ] Manually test Generate Scripts button: start dev server, click button, verify `scripts/01-deploy.sh` and `scripts/02-postdeploy.sh` exist (REQ-001)
- [ ] Clean up erroneous `../github/scripts/` directory if it exists from previous failed attempts (REQ-001)

### Phase 2: Fix ESLint Warnings

- [ ] Remove unused `osmFeatureFlag` and `wiFeatureFlag` variables from `helper/src/components/addonsTab.js` lines 8-9 (REQ-002)
- [ ] Remove unused `addons` from destructuring in `helper/src/components/clusterTab.js` line 15 (REQ-002)
- [ ] Change `==` to `===` for `cluster.SystemPoolType` comparison in `helper/src/components/clusterTab.js` line 227 (REQ-002)
- [ ] Remove unused `agw` variable and associated commented-out dead code block in `helper/src/components/deployTab.js` (REQ-002)
- [ ] Remove unused imports (Toggle, TooltipHost, Modal, IconButton) from `helper/src/components/portalnav.js` line 3 (REQ-002)
- [ ] Remove unused `mergeStyles` import from `helper/src/components/portalnav.js` line 5 (REQ-002)
- [ ] Add eslint-disable-next-line comment for intentional empty dependency array in `helper/src/components/portalnav.js` before line 139 (REQ-002)
- [ ] Remove unnecessary `\/` escape characters from regex string in `helper/src/components/portalnav.js` line 262 (REQ-002)
- [ ] Verify zero ESLint warnings on `npm start` compilation (REQ-002)
- [ ] Run full Playwright test suite to confirm no regressions from ESLint fixes (REQ-002)

### Phase 3: Migrate CRA to Vite

- [ ] Update `helper/package.json`: remove react-scripts and @babel/plugin-proposal-private-property-in-object; add vite and @vitejs/plugin-react (REQ-003)
- [ ] Update `helper/package.json` scripts section: start=vite, build=vite build, preview=vite preview; remove homepage, browserslist, eslintConfig, overrides (REQ-003)
- [ ] Create `helper/vite.config.js` with react plugin, base path `/AKS-Construction/`, port 3000, build output to `build/`, and saveScriptPlugin dev middleware (REQ-003)
- [ ] Move `helper/public/index.html` to `helper/index.html`; remove `%PUBLIC_URL%`; add `<script type="module" src="/src/index.jsx">` before `</body>` (REQ-003)
- [ ] Rename 9 JSX-containing files from `.js` to `.jsx`: index, App, portalnav, deployTab, addonsTab, clusterTab, networkTab, common, previewDialog (REQ-003)
- [ ] Migrate env var references in `helper/src/index.jsx`: `process.env.REACT_APP_APPINSIGHTS_KEY` to `import.meta.env.VITE_APPINSIGHTS_KEY` (REQ-003)
- [ ] Migrate env var references in `helper/src/components/portalnav.jsx` and `deployTab.jsx`: `REACT_APP_TEMPLATERELEASE` to `VITE_TEMPLATERELEASE` (4 references) (REQ-003)
- [ ] Delete `helper/src/setupProxy.js` (replaced by vite.config.js plugin) and `helper/src/reportWebVitals.js` (CRA-specific); remove reportWebVitals import/call from index.jsx (REQ-003)
- [ ] Update `scripts/00-predeploy.sh` line 56: remove `BROWSER=none` prefix from npm start command (REQ-003)
- [ ] Update CI workflow `.github/workflows/ghpagesTest.yml`: rename `REACT_APP_TEMPLATERELEASE` to `VITE_TEMPLATERELEASE` (REQ-003)
- [ ] Update CI workflows `.github/workflows/release.yml` and `release-soft.yml`: rename `REACT_APP_*` env vars to `VITE_*` (REQ-003)
- [ ] Run clean install: `rm -rf node_modules package-lock.json && npm install` — verify zero deprecation warnings (REQ-003)
- [ ] Verify `npm run build` succeeds and outputs to `helper/build/` directory (REQ-003)
- [ ] Verify dev server starts at `http://localhost:3000/AKS-Construction/` with `npm start` (REQ-003)
- [ ] Test "Generate Scripts" button works via Vite dev server saveScriptPlugin middleware (REQ-003)
- [ ] Run full Playwright test suite: `npx playwright test --browser chromium .playwrighttests/ --reporter list` (REQ-003)

---

**End of PRD**

*This PRD is optimized for Ralphy's checkbox task format. All tasks use `- [ ]` at column 1 for automated parsing. Section headers provide context for the AI agent executing tasks.*

*Task count: 31 tasks (5 Phase 1 + 10 Phase 2 + 16 Phase 3)*
