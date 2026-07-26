#!/usr/bin/env node
// Build the site: _data/*.json + _build/partials/* -> HTML at the repo root.
// Usage: node _build/build.mjs [--check]
//   --check  build in memory and fail if the committed HTML differs (CI drift guard)

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './render.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DATA = join(ROOT, '_data');

/* _data/<name>.json -> d.<camelCase name> */
const key = (f) => f.replace(/\.json$/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());

async function loadData() {
  const files = (await readdir(DATA)).filter(f => f.endsWith('.json'));
  const d = {};
  for (const f of files) {
    try {
      d[key(f)] = JSON.parse(await readFile(join(DATA, f), 'utf8'));
    } catch (err) {
      throw new Error(`_data/${f} is not valid JSON: ${err.message}`);
    }
  }
  return d;
}

export async function build() {
  return buildAll(await loadData(), {});
}

const check = process.argv.includes('--check');
const out = await build();

if (check) {
  const drift = [];
  for (const [file, content] of Object.entries(out)) {
    let onDisk = null;
    try { onDisk = await readFile(join(ROOT, file), 'utf8'); } catch { /* missing */ }
    if (onDisk !== content) drift.push(file);
  }
  if (drift.length) {
    console.error('Committed output is stale. Run `node _build/build.mjs` and commit:\n  ' + drift.join('\n  '));
    process.exit(1);
  }
  console.log(`✓ ${Object.keys(out).length} generated files match _data/`);
} else {
  for (const [file, content] of Object.entries(out)) {
    await writeFile(join(ROOT, file), content, 'utf8');
  }
  console.log(`✓ built ${Object.keys(out).length} files from _data/`);
}
