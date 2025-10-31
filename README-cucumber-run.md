# Running the Cucumber Sanity Feature

## Single Scenario Run
```powershell
npx cucumber-js HIS_FLIGHTBASE_B2C/features/sanity.feature --require HIS_FLIGHTBASE_B2C/features/step_definitions --require HIS_FLIGHTBASE_B2C/features/support
```

## All Features
```powershell
npx cucumber-js HIS_FLIGHTBASE_B2C/features/**/*.feature --require HIS_FLIGHTBASE_B2C/features/step_definitions --require HIS_FLIGHTBASE_B2C/features/support
```

## Optional Cleanup Before Run
```powershell
Remove-Item -Force -ErrorAction SilentlyContinue .\screenshots\*.png
Remove-Item -Force -ErrorAction SilentlyContinue .\screenshots\*.html
```

## Troubleshooting
- If a locator error occurs, open the latest `step-failure-*.html` in a browser and adjust the page object.
