const fs = require('fs');
const path = require('path');

let _cache = null;

function loadTestData() {
  if (_cache) return _cache;
  const filePath = path.resolve(process.cwd(), 'testData.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    _cache = JSON.parse(raw);
  } catch (e) {
    console.warn('[dataLoader] Failed to read testData.json:', e.message);
    _cache = {}; // fallback empty object
  }
  return _cache;
}

module.exports = { loadTestData };