# IBS HIS Automation – Playwright + Cucumber

End-to-end flight booking sanity tests using Playwright and Cucumber (BDD) with a Page Object Model. Reporting now uses `cucumber-html-reporter` fed by the Cucumber JSON formatter (the previous `@cucumber/html-formatter` CLI dependency has been removed).

---
## 1. Prerequisites
| Requirement | Why |
|-------------|-----|
| Node.js 18+ | Modern ES features & Playwright support |
| Git | Version control |
| Browsers (Playwright) | Installed separately from deps |

Verify Node:
```powershell
node -v
```

## 2. Install & Setup
```powershell
git clone <your-repo-url> IBS_HIS_Automation
cd IBS_HIS_Automation
npm install
npx playwright install
```

## 3. Current NPM Scripts
Defined in `package.json`:
| Script | Purpose |
|--------|---------|
| `npm test` | Runs all feature files sequentially via `scripts/run-base.js` (messages → HTML). |
| `npm run test:parallel` | Runs all features in parallel workers (default 4) via `scripts/run-parallel.js`. |

Both scripts produce:
```
reports/cucumber-messages.ndjson   # message stream
reports/cucumber-report.html       # human-readable HTML report
```

Open the HTML report in a browser after a run; file size > 0 confirms success.

## 4. Project Structure (Key Paths)
```
package.json
playwright.config.js                # (optional placeholder)
HIS_FLIGHTBASE_B2C/
  features/
    sanity.feature                  # Main booking scenario
    step_definitions/               # Step definition JS files
    support/                        # Hooks, World setup, data loading
pages/                              # Page Object Model classes
testData.json                       # Static test data consumed as sharedData
reports/                            # Generated messages + HTML report
screenshots/                        # Failure screenshots & (optional) HTML snapshots
scripts/                            # run-base.js / run-parallel.js wrappers
```

## 5. Test Data
Single file: `testData.json` (login, flight, passengers, payment, labels, optional `assertTimeout`). Loaded once in `hooks.js` and attached as `this.sharedData`. The previous multi-dataset folder / runner (`run-datasets.js`) is deprecated and not invoked by any script.

Modify values here instead of editing step definitions. Assertion timeout becomes `this.ASSERT_TIMEOUT` (default 10000 ms).

## 6. Running Tests
Sequential run:
```powershell
npm test
```
Parallel run:
```powershell
npm run test:parallel
```
Focused single feature (ad hoc):
```powershell
npx cucumber-js HIS_FLIGHTBASE_B2C/features/sanity.feature --require HIS_FLIGHTBASE_B2C/features/step_definitions --require HIS_FLIGHTBASE_B2C/features/support --format progress
```

## 7. Reporting Flow (Wrapper Scripts)
1. Execute Cucumber with `--format json:reports/cucumber-report.json` plus progress (sequential or parallel).
2. Wrapper script invokes `cucumber-html-reporter` programmatically to build `reports/cucumber-report.html`.
3. Size check logs a warning if the HTML file is empty.

Why this approach? Simpler dependency surface (no standalone CLI), integrates cleanly with Node API, and allows richer metadata injection.

## 8. Debugging Failures
Artifacts:
| Type | Location | Notes |
|------|----------|-------|
| Screenshot | `screenshots/` | Captured on step failure. |
| HTML snapshot (optional) | `screenshots/` | Enabled only if `ATTACH_HTML=1`. |
| Messages stream | `reports/cucumber-messages.ndjson` | Source of final HTML report. |
| HTML report | `reports/cucumber-report.html` | Scenario/step breakdown. |

Quick triage checklist:
1. Open HTML report for failed step location.
2. Inspect matching screenshot / snapshot.
3. Re-run with Playwright inspector:
```powershell
PWDEBUG=1 npx cucumber-js HIS_FLIGHTBASE_B2C/features/sanity.feature --require HIS_FLIGHTBASE_B2C/features/step_definitions --require HIS_FLIGHTBASE_B2C/features/support
```

## 9. Cleaning Artifacts
```powershell
Remove-Item -Force -ErrorAction SilentlyContinue .\screenshots\*.png
Remove-Item -Force -ErrorAction SilentlyContinue .\screenshots\*.html
Remove-Item -Force -ErrorAction SilentlyContinue .\reports\cucumber-*.html
```

## 10. Configuration Files
### `testConfig_HIS.json`
Runtime settings (browser, environment, base URLs, headless flag). Hooks determine effective base URL using `process.env.TEST_ENV || cfg.env`.

### `testData.json`
Static scenario inputs referenced via `this.sharedData`. Update flights, passengers, payment card, assertion timeout here.

### `jsconfig.json`
Enables IntelliSense + type checking for JS. Add path aliases or world typings as needed.

## 11. CI Example (Sequential)
```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cucumber-report
          path: reports/cucumber-report.html
```

Parallel CI can mirror `npm run test:parallel`; ensure runner OS has sufficient CPU resources.

## 12. Deprecated / Historical Artifacts
| Item | Status | Replacement |
|------|--------|------------|
| `run-datasets.js` | Not invoked | Future enhancement if multi-variant runs return |
| `@cucumber/html-formatter` CLI phase | Removed | JSON formatter + cucumber-html-reporter |
| Env login overrides | Removed | Static credentials from `testData.json` (`sharedData.login`) |

## 13. Next Potential Enhancements
- Add lock file & switch CI to `npm ci`.
- Parameterize parallel worker count via env (e.g., `WORKERS=6`).
- Implement tag filtering (e.g., `@sanity`, `@slow`) in wrapper scripts.
- Introduce JSON schema for `testData.json` validation on load.
- Reservation number robust assertion (locator + pattern) once booking succeeds consistently.

## 14. FAQ
| Question | Answer |
|----------|--------|
| Why messages → HTML instead of direct html formatter? | Avoids runtime API mismatch & empty file race conditions. |
| Can I delete `run-datasets.js`? | Yes; it's safe. Keep if you expect multi-dataset runs later. |
| Where do I change timeouts? | `testData.json` (`assertTimeout`) or targeted waits in page objects. |
| How to re-run just one feature? | Use direct `npx cucumber-js <path>` with required folders. |

---
Keep this document updated when scripts or data loading approaches change. Older sections about multi-dataset runners have been removed to reflect the simplified current state.
