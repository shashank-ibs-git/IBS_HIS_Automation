# IBS_HIS_Automation

End-to-end UI automation suite for HIS Flight BASE (Overseas Air) using Playwright + Cucumber (BDD) in Node.js.

## Tech Stack
- Node.js / Playwright (browser automation)
- Cucumber.js (Gherkin BDD scenarios)
- Page Object Model (modular test actions)
- PowerShell commands (Windows dev environment)

## Project Structure (key folders)
```
pageObjectsHIS/            # Page Object classes (TopPage, SearchResultsPage, etc.)
HIS_FLIGHTBASE_B2C/features
  step_definitions/        # Cucumber step implementations
  support/                 # Hooks, utilities, world setup
screenshots/               # Failure artifacts (ignored by git)
```

## Setup
Install dependencies:
```
npm install
```
(Optional) Install Playwright browsers:
```
npx playwright install
```

## Running Tests
All features:
```
npx cucumber-js -p all
```
Single feature (update path as needed):
```
npx cucumber-js -p single HIS_FLIGHTBASE_B2C/features/OneWaySearch.feature
```
Environment-driven single feature:
```
$env:FEATURE="HIS_FLIGHTBASE_B2C/features/OneWaySearch.feature"; npx cucumber-js -p envSingle
```

## Debugging
Use VS Code launch configuration "Cucumber: Debug current feature (fail-fast)" to run just the currently open `.feature` file with breakpoints.

## Page Object Highlights
- `TopPage.selectDepartureDate(month, year, day)` encapsulates calendar selection.
- `SearchResultsPage.waitForResultsOrNoResults()` polls for either results list or a no-results banner.
- Passenger selection methods normalize increment/decrement flows and child age dropdown assignment.

## Adding New Scenarios
1. Create a `.feature` file under `features/`.
2. Add step definitions under `step_definitions/` reusing existing page object methods.
3. Run with the `single` profile for quick iteration.

## Git Hygiene
Generated / transient content is excluded via `.gitignore` (reports, screenshots, node_modules, cache, etc.). Adjust as needed.

## Migrating to New Repository
If you cloned a legacy repo and want to push here:
```
git remote remove origin
# Create new repo on GitHub, then add:
git remote add origin https://github.com/<your-username>/<new-repo>.git
git branch -M main
git push -u origin main
```

## Troubleshooting
- If date selection intermittently fails, confirm the Next/Previous month buttons are present; increase timeout in `selectCalendarDate` if needed.
- If selectors break after UI changes, update only the new selectors (avoid modifying legacy ones unless necessary).

## License
Internal automation project – add license text here if distributing externally.
