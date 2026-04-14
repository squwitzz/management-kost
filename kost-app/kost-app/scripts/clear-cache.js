#!/usr/bin/env node

/**
 * Clear Next.js cache and service worker
 * Run: node scripts/clear-cache.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing cache...\n');

// Clear .next directory
const nextDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Cleared .next directory');
} else {
  console.log('ℹ️  .next directory not found');
}

// Clear node_modules/.cache
const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✅ Cleared node_modules/.cache');
} else {
  console.log('ℹ️  node_modules/.cache not found');
}

console.log('\n✨ Cache cleared successfully!');
console.log('\n📝 Next steps:');
console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
console.log('2. Unregister service worker in DevTools');
console.log('3. Hard refresh browser (Ctrl+Shift+R)');
console.log('4. Restart dev server: npm run dev\n');
