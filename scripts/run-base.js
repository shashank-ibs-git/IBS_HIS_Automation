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
const messagesFile = `${reportsDir}/cucumber-messages.ndjson`;

// Phase 1: run cucumber producing messages only (plus progress)
const runCmd = `npx cucumber-js ${featureGlob} --format progress --format message:${messagesFile}`;
console.log(`Running: ${runCmd}`);
const child = spawn(runCmd, { shell: true, stdio: 'inherit', env: process.env });
child.on('exit', (code) => {
  if (code !== 0) {
    console.warn(`Cucumber exited with code ${code}. Will still attempt HTML generation if messages exist.`);
  }
  try {
    if (!fs.existsSync(messagesFile) || fs.statSync(messagesFile).size === 0) {
      console.error('❌ No messages file generated; cannot build HTML report.');
      return process.exit(code || 1);
    }
  } catch (e) {
    console.error('Error inspecting messages file:', e.message || e);
    return process.exit(code || 1);
  }
  // Phase 2: build HTML via standalone formatter CLI (avoids plugin interface mismatch)
  const buildCmd = `npx @cucumber/html-formatter --output ${htmlFile} ${messagesFile}`;
  console.log(`Building HTML: ${buildCmd}`);
  const builder = spawn(buildCmd, { shell: true, stdio: 'inherit', env: process.env });
  builder.on('exit', (bCode) => {
    try {
      if (fs.existsSync(htmlFile)) {
        const sz = fs.statSync(htmlFile).size;
        if (sz === 0) {
          console.error('⚠️ Generated HTML report is empty.');
        } else {
          console.log(`✅ HTML report generated (${(sz/1024).toFixed(1)} KB): ${htmlFile}`);
        }
      } else {
        console.error('❌ HTML report file not created by CLI.');
      }
    } catch (e) {
      console.error('Error checking final report:', e.message || e);
    }
    process.exit(code || bCode);
  });
});
