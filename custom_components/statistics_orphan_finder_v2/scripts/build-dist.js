#!/usr/bin/env node

/**
 * Build distribution package for Home Assistant deployment
 * Creates a dist/ folder with only the files needed by HA
 */

import { copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Files to copy (relative to root)
const FILES_TO_COPY = [
  // Python backend
  '__init__.py',
  'config_flow.py',
  'coordinator.py',
  'const.py',
  'manifest.json',
  'strings.json',

  // Frontend (built)
  'www/statistics-orphan-panel.js',
  'www/statistics-orphan-panel.js.map'
];

console.log('🚀 Building distribution package...\n');

// Remove old dist if exists
if (existsSync(distDir)) {
  console.log('📦 Removing old dist folder...');
  rmSync(distDir, { recursive: true, force: true });
}

// Create dist and www directories
console.log('📁 Creating dist directories...');
mkdirSync(distDir, { recursive: true });
mkdirSync(join(distDir, 'www'), { recursive: true });

// Copy files
let copiedCount = 0;
let skippedCount = 0;

console.log('\n📋 Copying files:\n');

for (const file of FILES_TO_COPY) {
  const sourcePath = join(rootDir, file);
  const targetPath = join(distDir, file);

  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, targetPath);
    console.log(`  ✅ ${file}`);
    copiedCount++;
  } else {
    console.log(`  ⚠️  ${file} (not found, skipped)`);
    skippedCount++;
  }
}

console.log(`\n✨ Distribution build complete!`);
console.log(`   📦 Location: ${distDir}`);
console.log(`   ✅ Copied: ${copiedCount} files`);
if (skippedCount > 0) {
  console.log(`   ⚠️  Skipped: ${skippedCount} files`);
}
console.log(`\n💡 To deploy: Copy contents of dist/ to Home Assistant's custom_components/statistics_orphan_finder_v2/`);
