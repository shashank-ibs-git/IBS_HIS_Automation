// Unified Cucumber configuration with profiles for running all features or a single feature.
// Usage examples:
//   npx cucumber-js -p all                -> run all features
//   npx cucumber-js -p single ./path/to/file.feature  -> run one feature (supply path arg after profile)
//   FEATURE=./path/to/file.feature npx cucumber-js -p envSingle  -> run one feature via environment variable
// Environment flags:
//   FAIL_FAST=true       -> stop on first failure
//   PARALLEL=4           -> run scenarios in parallel (be careful with shared state)

function envFlagTrue(name) {
  return process.env[name] && /^(true|1|yes)$/i.test(process.env[name]);
}

const parallel = parseInt(process.env.PARALLEL || '1', 10);
const failFast = envFlagTrue('FAIL_FAST');

module.exports = {
  // Default keeps backward compatibility: run all features.
  default: {
    paths: ["HIS_FLIGHTBASE_B2C/features/**/*.feature"],
    require: [
      "HIS_FLIGHTBASE_B2C/features/support/hooks.js",
      "HIS_FLIGHTBASE_B2C/features/step_definitions/**/*.js"
    ],
    format: ["progress", "html:reports/cucumber-report.html"],
    publishQuiet: true,
    backtrace: false,
    parallel,
    retry: 0,
    failFast
  },
  // Explicit profile for all features (same as default but named for clarity)
  all: {
    paths: ["HIS_FLIGHTBASE_B2C/features/**/*.feature"],
    require: [
      "HIS_FLIGHTBASE_B2C/features/support/hooks.js",
      "HIS_FLIGHTBASE_B2C/features/step_definitions/**/*.js"
    ],
    format: ["progress", "html:reports/cucumber-report.html"],
    publishQuiet: true,
    backtrace: false,
    parallel,
    retry: 0,
    failFast
  },
  // Profile intended for passing a single feature file path as CLI arg after -p single
  single: {
    // No glob: rely on explicit CLI argument feature file(s)
    require: [
      "HIS_FLIGHTBASE_B2C/features/support/hooks.js",
      "HIS_FLIGHTBASE_B2C/features/step_definitions/**/*.js"
    ],
    format: ["progress", "html:reports/cucumber-report.html"],
    publishQuiet: true,
    backtrace: false,
    parallel: 1,
    retry: 0,
    failFast
  },
  // Profile that reads a single feature from FEATURE env var (FEATURE must point to a .feature file)
  envSingle: {
    paths: process.env.FEATURE ? [process.env.FEATURE] : [],
    require: [
      "HIS_FLIGHTBASE_B2C/features/support/hooks.js",
      "HIS_FLIGHTBASE_B2C/features/step_definitions/**/*.js"
    ],
    format: ["progress", "html:reports/cucumber-report.html"],
    publishQuiet: true,
    backtrace: false,
    parallel: 1,
    retry: 0,
    failFast
  }
};
