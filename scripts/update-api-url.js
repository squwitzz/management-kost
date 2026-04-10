#!/usr/bin/env node

/**
 * Script to update API URL in all files
 * Usage: node scripts/update-api-url.js <new-api-url>
 * Example: node scripts/update-api-url.js https://abc123.ngrok-free.app
 */

const fs = require('fs');
const path = require('path');

const newApiUrl = process.argv[2];

if (!newApiUrl) {
  console.error('❌ Error: Please provide the new API URL');
  console.log('Usage: node scripts/update-api-url.js <new-api-url>');
  console.log('Example: node scripts/update-api-url.js https://abc123.ngrok-free.app');
  process.exit(1);
}

// Update .env.production
const envProductionPath = path.join(__dirname, '..', '.env.production');
const envContent = `# Backend API URL\nNEXT_PUBLIC_API_URL=${newApiUrl}/api\n`;

fs.writeFileSync(envProductionPath, envContent);
console.log('✅ Updated .env.production');

// Update .env.local for development
const envLocalPath = path.join(__dirname, '..', '.env.local');
fs.writeFileSync(envLocalPath, envContent);
console.log('✅ Updated .env.local');

console.log('\n📝 Next steps:');
console.log('1. RESTART the dev server: Stop (Ctrl+C) and run "npm run dev" again');
console.log('2. Or for production: npm run build && npm start');
console.log(`\n🌐 API URL set to: ${newApiUrl}/api`);
