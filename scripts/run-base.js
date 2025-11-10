#!/usr/bin/env node
/**
 * Wrapper for base (non-parallel) Cucumber run that produces both
 * messages (NDJSON) and direct html-formatter output; if the direct
 * HTML file ends up empty (intermittent upstream issue) it regenerates
 * from the messages file as a fallback.
 */
const { spawn } = require('child_process');
const fs = require('fs');

const featureGlob = 'HIS_FLIGHTBASE_B2C/features/**/*.feature';
const reportsDir = 'reports';
fs.mkdirSync(reportsDir, { recursive: true });

const htmlFile = `${reportsDir}/cucumber-report.html`;
const jsonFile = `${reportsDir}/cucumber-report.json`;

// Run cucumber producing JSON (for cucumber-html-reporter) + progress
const runCmd = `npx cucumber-js ${featureGlob} --format progress --format json:${jsonFile}`;
console.log(`Running: ${runCmd}`);
const child = spawn(runCmd, { shell: true, stdio: 'inherit', env: process.env });
child.on('exit', (code) => {
  if (code !== 0) {
    console.warn(`Cucumber exited with code ${code}. Will still attempt HTML generation if messages exist.`);
  }
  try {
    if (!fs.existsSync(jsonFile) || fs.statSync(jsonFile).size === 0) {
      console.error('❌ No JSON report generated; cannot build HTML report.');
      return process.exit(code || 1);
    }
  } catch (e) {
    console.error('Error inspecting JSON report file:', e.message || e);
    return process.exit(code || 1);
  }

  // Generate HTML using cucumber-html-reporter
  try {
    const reporter = require('cucumber-html-reporter');
    /** @type {import('cucumber-html-reporter').Options} */
    const options = {
      theme: 'bootstrap', // explicitly matches allowed string union
      jsonFile: jsonFile,
      output: htmlFile,
      reportSuiteAsScenarios: true,
      launchReport: false,
      metadata: {
        'Platform': process.platform,
        'Node Version': process.version,
        'Run Mode': 'sequential'
      }
    };
    reporter.generate(options);
    const sz = fs.statSync(htmlFile).size;
    if (sz === 0) {
      console.error('⚠️ Generated HTML report is empty.');
    } else {
      console.log(`✅ HTML report generated (${(sz/1024).toFixed(1)} KB): ${htmlFile}`);
    }
  } catch (e) {
    console.error('❌ Failed to generate HTML using cucumber-html-reporter:', e.message || e);
  }
  process.exit(code || 0);
});
