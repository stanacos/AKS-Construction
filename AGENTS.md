# Repository Guidelines

## Project Structure & Module Organization
- `bicep/`: Core AKS infrastructure templates. `main.bicep` orchestrates module files such as `network.bicep`, `nsg.bicep`, and `appgw.bicep`.
- `bicep/compiled/`: Generated ARM JSON output (build artifact).
- `helper/`: React-based configuration wizard (CRA). Main UI code is in `helper/src/components/`; browser tests live in `helper/.playwrighttests/`.
- `scripts/`: Local bootstrap (`00-predeploy.sh`) plus generated deployment scripts (`01-deploy.sh`, `02-postdeploy.sh`).
- `postdeploy/`: Helm charts and post-deployment scripts.
- `samples/`: Scenario templates (for example `windows/`, `flux/`, `shared-acr/`).

## Build, Test, and Development Commands
- `./scripts/00-predeploy.sh`: Installs helper dependencies, starts the wizard, and opens `http://localhost:3000/AKS-Construction`.
- `cd helper && npm start`: Run the helper UI locally.
- `cd helper && npm run build`: Build production helper assets.
- `az bicep build --file bicep/main.bicep --outdir bicep/compiled`: Compile IaC to ARM JSON.
- `bash bicep/tests/test-req002-parameter-defaults.sh`: Validate key parameter defaults in compiled output.
- `cd helper && npx playwright install && npx playwright test --browser chromium .playwrighttests/`: Run UI/regression tests.

## Coding Style & Naming Conventions
- Follow existing file style; avoid mixed formatting in touched files.
- Bicep: keep parameter defaults conservative, add `@description` decorators, and respect analyzer rules in `bicep/bicepconfig.json`.
- React/JS: use functional components, single quotes, semicolons, `PascalCase` for components, and `camelCase` for variables/props.
- For testable UI changes, add stable `data-testid` attributes.

## Testing Guidelines
- UI tests use Playwright. Stable specs follow `helper-test-*.spec.js`; temporary/maturing tests use the `helper-fragile` keyword.
- Infrastructure changes should include at least a Bicep compile check and, when defaults/parameters change, updates to related regression tests and parameter files under `.github/workflows_dep/regressionparams/`.

## Commit & Pull Request Guidelines
- Prefer imperative commit messages (for example, `Update helper dependencies`) and include requirement tags when relevant (for example, `(REQ-010)`).
- PRs should follow `.github/PULL_REQUEST_TEMPLATE.md`: meaningful title, clear summary, linked issue, and UI screenshots when UI is changed.
- Keep PRs focused; call out any breaking parameter changes explicitly.
