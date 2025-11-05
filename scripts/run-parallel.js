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
const messagesFile = `${reportsDir}/cucumber-messages.ndjson`;

const runCmd = `npx cucumber-js ${featureGlob} --parallel ${workers} --format progress --format message:${messagesFile}`;
console.log(`Running (parallel=${workers}): ${runCmd}`);
const child = spawn(runCmd, { shell: true, stdio: 'inherit', env: process.env });
child.on('exit', (code) => {
  if (code !== 0) {
    console.warn(`Parallel cucumber exited with code ${code}; attempting HTML build anyway.`);
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
  const buildCmd = `npx @cucumber/html-formatter --output ${htmlFile} ${messagesFile}`;
  console.log(`Building HTML: ${buildCmd}`);
  const builder = spawn(buildCmd, { shell: true, stdio: 'inherit', env: process.env });
  builder.on('exit', (bCode) => {
    try {
      if (fs.existsSync(htmlFile)) {
        const sz = fs.statSync(htmlFile).size;
        if (sz === 0) {
          console.error('⚠️ Generated HTML report is empty (parallel run).');
        } else {
          console.log(`✅ HTML report generated (${(sz/1024).toFixed(1)} KB): ${htmlFile}`);
        }
      } else {
        console.error('❌ HTML report file not created by CLI (parallel run).');
      }
    } catch (e) {
      console.error('Error checking final report:', e.message || e);
    }
    process.exit(code || bCode);
  });
});
// Removed obsolete log referencing undefined variable 'cmd'.

