#!/usr/bin/env node
/**
 * Wrapper for parallel Cucumber run with fallback HTML regeneration.
 */
const { spawn } = require('child_process');
const fs = require('fs');

const workers = 4; // fixed per original script; can be parameterized later
const featureGlob = 'HIS_FLIGHTBASE_B2C/features/**/*.feature';
const reportsDir = 'reports';
fs.mkdirSync(reportsDir, { recursive: true });

const htmlFile = `${reportsDir}/cucumber-report.html`;
const jsonFile = `${reportsDir}/cucumber-report.json`;

const runCmd = `npx cucumber-js ${featureGlob} --parallel ${workers} --format progress --format json:${jsonFile}`;
console.log(`Running (parallel=${workers}): ${runCmd}`);
const child = spawn(runCmd, { shell: true, stdio: 'inherit', env: process.env });
child.on('exit', (code) => {
  if (code !== 0) {
    console.warn(`Parallel cucumber exited with code ${code}; attempting HTML build anyway.`);
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
  // Generate HTML using cucumber-html-reporter (parallel mode metadata)
  try {
    const reporter = require('cucumber-html-reporter');
    /** @type {import('cucumber-html-reporter').Options} */
    const options = {
      theme: 'bootstrap',
      jsonFile: jsonFile,
      output: htmlFile,
      reportSuiteAsScenarios: true,
      launchReport: false,
      metadata: {
        'Platform': process.platform,
        'Node Version': process.version,
        'Parallel Workers': String(workers)
      }
    };
    reporter.generate(options);
    const sz = fs.statSync(htmlFile).size;
    if (sz === 0) {
      console.error('⚠️ Generated HTML report is empty (parallel run).');
    } else {
      console.log(`✅ HTML report generated (${(sz/1024).toFixed(1)} KB): ${htmlFile}`);
    }
  } catch (e) {
    console.error('❌ Failed to generate HTML using cucumber-html-reporter (parallel):', e.message || e);
  }
  process.exit(code || 0);
});
// Removed obsolete log referencing undefined variable 'cmd'.

