// cucumber.js — configuration for HIS_FLIGHTBASE_B2C project
module.exports = {
  default: {
    // Path to your .feature files
    paths: ["HIS_FLIGHTBASE_B2C/features/**/*.feature"],

    // Step definitions and hooks under HIS_FLIGHTBASE_B2C/features
    require: [
      "HIS_FLIGHTBASE_B2C/features/support/hooks.js",
      "HIS_FLIGHTBASE_B2C/features/step_definitions/**/*.js"
    ],

    // Built-in Cucumber HTML report (no extra package needed)
    format: ["progress", "html:reports/cucumber-report.html"],

    publishQuiet: true,
    backtrace: false,
    parallel: 1,
    retry: 0,
    failFast: false
  }
};
