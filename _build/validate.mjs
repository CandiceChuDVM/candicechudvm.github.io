#!/usr/bin/env node
// Pre-deploy validation. Fails the build on real problems; warns on things a
// human should look at. Run: node _build/validate.mjs
import { readFile, readdir, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const PAGES = ['index.html', 'research.html', 'ai-education.html', 'vetclinpathgpt.html',
  'publications.html', 'speaking.html', 'team.html', 'about.html', 'news.html',
  'teaching.html', 'cv.html'];

const site = JSON.parse(await readFile(join(ROOT, '_data/site.json'), 'utf8'));
const CANON = site.seo.baseUrl.replace(/^https?:\/\//, '');

/* ── 1. per-page SEO + accessibility structure ─────── */
const html = {};
for (const p of PAGES) {
  let src;
  try { src = await readFile(join(ROOT, p), 'utf8'); }
  catch { fail(`${p}: missing — run node _build/build.mjs`); continue; }
  html[p] = src;

  const title = src.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  if (!title) fail(`${p}: no <title>`);
  // index.html carries the agreed brand string, which is deliberately longer.
  else if (title.length > 65 && p !== 'index.html') warn(`${p}: title is ${title.length} chars (>65 may truncate in search results)`);

  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  if (!desc) fail(`${p}: no meta description`);
  else if (desc.length < 70 || desc.length > 175) warn(`${p}: meta description is ${desc.length} chars (aim 70–175)`);

  const canon = src.match(/<link rel="canonical" href="([^"]*)"/)?.[1] || '';
  if (!canon) fail(`${p}: no canonical URL`);
  else if (!canon.includes(CANON)) fail(`${p}: canonical is not on ${CANON} — got ${canon}`);

  const h1s = src.match(/<h1[\s>]/g) || [];
  if (h1s.length === 0) fail(`${p}: no <h1>`);
  if (h1s.length > 1) fail(`${p}: ${h1s.length} <h1> elements — exactly one per page`);

  for (const img of src.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt=/.test(img)) fail(`${p}: <img> without alt attribute: ${img.slice(0, 90)}`);
    else if (/\salt=""/.test(img)) warn(`${p}: <img> with empty alt (fine only if purely decorative)`);
  }

  for (const ld of src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
    const json = ld.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    try { JSON.parse(json); } catch (e) { fail(`${p}: invalid JSON-LD — ${e.message}`); }
  }

  if (/\b(TODO|TBD|Lorem ipsum|PLACEHOLDER|FIXME|XXX)\b/i.test(src.replace(/<!--[\s\S]*?-->/g, ''))) {
    fail(`${p}: contains a placeholder marker (TODO/TBD/Lorem ipsum) in rendered output`);
  }
  // Internal build details must never reach a public page. Notes for maintainers
  // belong in underscore-prefixed _data keys, which the renderer never reads.
  const visible = src.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  for (const m of visible.match(/_data\/[\w.-]*|\b[\w-]+\.json\b|\b(?:course\.schedule|studentComments|publish:\s*false|_todo)\b|_build\//g) || []) {
    fail(`${p}: leaks an internal repo path or data field name into public content — "${m}". Move maintainer notes into an underscore-prefixed _data key.`);
  }
  if (/\bpending\b/i.test(visible.replace(/<(script|style)[\s\S]*?<\/\1>/g, ''))) {
    warn(`${p}: the word "pending" appears in public copy — confirm it is describing the work, not an unfinished build step`);
  }
  if (/\bundefined\b|\bnull\b|\[object Object\]|NaN/.test(src.replace(/<script[\s\S]*?<\/script>/g, ''))) {
    fail(`${p}: rendered output contains undefined/null/[object Object] — a data field is missing`);
  }
}

/* ── 2. internal links and local assets resolve ────── */
const exists = async (rel) => { try { await access(join(ROOT, rel)); return true; } catch { return false; } };
const seen = new Set();
for (const [p, src] of Object.entries(html)) {
  for (const m of src.matchAll(/(?:href|src)="([^"#?][^"]*?)"/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|data:|tel:|\/\/)/.test(target)) continue;
    const clean = target.split('#')[0].split('?')[0];
    if (!clean) continue;
    const k = p + '>' + clean;
    if (seen.has(k)) continue;
    seen.add(k);
    if (!await exists(clean)) fail(`${p}: broken local link → ${clean}`);
  }
  for (const m of src.matchAll(/href="([^"]*#[^"]+)"/g)) {
    const [file, anchor] = m[1].split('#');
    const target = file ? html[file] : src;
    if (target && anchor && !target.includes(`id="${anchor}"`)) {
      warn(`${p}: anchor #${anchor} not found in ${file || p}`);
    }
  }
}

/* ── 3. data-layer integrity ───────────────────────── */
const data = {};
for (const f of (await readdir(join(ROOT, '_data'))).filter(f => f.endsWith('.json'))) {
  const k = f.replace(/\.json$/, '');
  try { data[k] = JSON.parse(await readFile(join(ROOT, '_data', f), 'utf8')); }
  catch (e) { fail(`_data/${f}: invalid JSON — ${e.message}`); }
}

// Privacy contract: these must never appear in funding data at all.
const BANNED = ['amount', 'totalCost', 'total_cost', 'directCost', 'indirectCost',
  'grantNumber', 'grant_number', 'awardNumber', 'collaborators', 'coInvestigators'];
for (const f of data.funding?.items || []) {
  for (const b of BANNED) {
    if (b in f) fail(`_data/funding.json (${f.id}): field "${b}" is not allowed — award amounts, grant numbers and collaborator lists must never be stored or published`);
  }
  if (f.publish !== false && !f.title) fail(`_data/funding.json (${f.id}): published award has no title`);
  if (f.publish === false) warn(`_data/funding.json (${f.id}): held back — ${f._todo || 'no reason recorded'}`);
  if (f.showLogo && !f.logo) fail(`_data/funding.json (${f.id}): showLogo is true but no logo file is given`);
  if (f._confirmTitle) warn(`_data/funding.json (${f.id}): title needs confirming — ${f._confirmTitle}`);
}

// DOI + date shape
for (const p of [...(data.publications?.items || []), ...(data.publications?.otherWriting || [])]) {
  if (/^#\d+/.test(p.number || '')) fail(`_data/publications.json (${p.id}): number must be a journal + year label, not a "#N" sequence — items are reordered when papers are added, leaving visible gaps`);
}
for (const p of data.publications?.items || []) {
  if (p.doi && !/^10\.\d{4,9}\/\S+$/.test(p.doi)) fail(`_data/publications.json (${p.id}): malformed DOI "${p.doi}"`);
  if (p.year && !/^\d{4}$/.test(String(p.year))) fail(`_data/publications.json (${p.id}): year must be YYYY`);
  if (!p.topics?.length) warn(`_data/publications.json (${p.id}): no topics — it will only appear under "All"`);
}
for (const n of data.news?.items || []) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.iso || '')) fail(`_data/news.json: iso date must be YYYY-MM-DD — got "${n.iso}"`);
}
const isoOrder = (data.news?.items || []).map(n => n.iso);
if (isoOrder.join() !== [...isoOrder].sort().reverse().join()) {
  warn('_data/news.json: items are not in newest-first order');
}

// Rich-text allowlist
const ALLOWED = new Set(['a', 'em', 'strong', 'br', 'code', 'sub', 'sup']);
const walk = (node, path) => {
  if (typeof node === 'string') {
    for (const m of node.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)) {
      if (!ALLOWED.has(m[1].toLowerCase())) {
        fail(`${path}: tag <${m[1]}> is not allowed in data (allowed: ${[...ALLOWED].join(', ')})`);
      }
    }
    for (const m of node.matchAll(/<a\b[^>]*href="(https?:[^"]*)"[^>]*>/g)) {
      if (!/rel="[^"]*noopener/.test(m[0]) || !/target="_blank"/.test(m[0])) {
        warn(`${path}: external link should carry target="_blank" rel="noopener"`);
      }
    }
  } else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('_')) walk(v, `${path}.${k}`);
  }
};
for (const [k, v] of Object.entries(data)) walk(v, `_data/${k}.json`);

// Referential integrity
const ids = new Set((data.publications?.items || []).map(p => p.id));
for (const id of data.home?.featuredPublications || []) {
  if (!ids.has(id)) fail(`_data/home.json: featuredPublications references unknown publication id "${id}"`);
}
for (const n of data.site?.nav || []) {
  if (!PAGES.includes(n.href)) fail(`_data/site.json: nav points to "${n.href}", which is not a generated page`);
}
for (const [from, to] of Object.entries(data.site?.redirects || {})) {
  if (!PAGES.includes(to)) fail(`_data/site.json: redirect ${from} → ${to} targets a page that is not generated`);
}

// Sitemap freshness
try {
  const sm = await readFile(join(ROOT, 'sitemap.xml'), 'utf8');
  for (const p of PAGES) {
    const loc = `${site.seo.baseUrl}/${p === 'index.html' ? '' : p}`;
    if (!sm.includes(`<loc>${loc}</loc>`)) fail(`sitemap.xml: missing ${loc}`);
  }
} catch { fail('sitemap.xml: missing — run node _build/build.mjs'); }

// Machine-readability: social cards, crawler directives, llms.txt
for (const [p, src] of Object.entries(html)) {
  for (const tag of ['og:image:alt', 'og:site_name', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!src.includes(tag)) fail(`${p}: missing ${tag} meta tag`);
  }
  if (!/<meta name="robots" content="index, follow/.test(src)) fail(`${p}: missing robots meta directive`);
  if (!/<meta name="author"/.test(src)) fail(`${p}: missing author meta tag`);
}
try {
  const llms = await readFile(join(ROOT, 'llms.txt'), 'utf8');
  for (const n of site.nav) {
    const url = `${site.seo.baseUrl}/${n.href === 'index.html' ? '' : n.href}`;
    if (!llms.includes(url)) fail(`llms.txt: missing ${url}`);
  }
} catch { fail('llms.txt: missing — run node _build/build.mjs'); }
try {
  const rb = await readFile(join(ROOT, 'robots.txt'), 'utf8');
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    if (!rb.includes(bot)) warn(`robots.txt: no explicit rule for ${bot}`);
  }
} catch { fail('robots.txt: missing — run node _build/build.mjs'); }

/* ── report ────────────────────────────────────────── */
for (const w of warnings) console.warn('warn  ' + w);
for (const e of errors) console.error('ERROR ' + e);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${PAGES.length} pages.`);
process.exit(errors.length ? 1 : 0);
