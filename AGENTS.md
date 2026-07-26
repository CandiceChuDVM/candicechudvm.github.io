# Website operating instructions

This repository hosts the academic website of **Candice P. Chu, DVM, PhD, DACVP**.

Production URL: <https://candicechudvm.com>

Positioning: **Veterinary AI, Digital Cytology, Diagnostic AI, Large Language Models, and AI Education.**

---

## 1. The single most important rule

**Never edit the HTML files at the repo root. They are generated output.**

Content lives in `_data/*.json`. Design lives in `_build/render.mjs` and `css/`. To change
the site you change data (or, for layout, the renderer) and then rebuild:

```bash
node _build/build.mjs      # regenerate every page
node _build/validate.mjs   # must pass before deploying
```

Editing `index.html` directly will be silently reverted on the next build, and CI will
reject the pull request (`node _build/build.mjs --check` fails on drift).

---

## 2. Repository map

```
_data/           Content. One JSON file per page + site.json, funding.json.
_build/render.mjs  All markup. Pure functions, no I/O. Single source of truth for design.
_build/build.mjs   Node entry: _data + partials -> HTML at repo root.
_build/validate.mjs  Pre-deploy checks. Exit code 1 blocks deployment.
_build/partials/   Hand-authored design fragments (hero illustration SVG).
css/style.css      Design tokens: colours, type, base components. Rarely changes.
css/site.css       Page components layered on top.
*.html             GENERATED. Do not edit.
sitemap.xml, robots.txt   GENERATED.
```

`_data/<name>.json` is exposed to the renderer as `d.<camelCaseName>`, so
`_data/ai-education.json` is `d.aiEducation`.

---

## 3. Content rules

1. **Preserve factual accuracy.** Every date, title, venue, number and author must trace to
   the CV, a publication, or something the user explicitly stated in this session.
2. **Do not invent or infer** dates, funding amounts, authorship, study results, audience
   size, evaluation scores, appointments, awards, collaborators, or institutional adoption.
   Wording and organisation may be improved; facts may not be created.
3. When information is missing: add the item with `"publish": false` and a `"_todo"` note
   explaining exactly what is needed, then **ask the user**. Never publish a guess.
   `validate.mjs` reports every held-back item so nothing is silently forgotten.
4. **American English.** No promotional or exaggerated claims — the audience includes grant
   reviewers and collaborators.
5. **No emoji in biographies, research descriptions, or funding text.** Emoji are tolerated
   only as type markers in `_data/news.json`.
6. Add relevant internal links; every new page needs a unique title, meta description,
   canonical URL, image alt text, and JSON-LD where a schema.org type fits.
7. Rich text inside `_data` is limited to `<a> <em> <strong> <br> <code> <sub> <sup>`.
   External links must carry `target="_blank" rel="noopener"`. Enforced by `validate.mjs`.

---

## 4. Funding privacy contract

Non-negotiable, and enforced in two places (`fundingCard()` in the renderer, and a banned-field
check in `validate.mjs`):

| Published | Never published |
| --- | --- |
| Sponsor name and official URL | Award amount |
| Official project title | Grant / award number |
| Role (e.g. Principal Investigator) | Collaborator and co-investigator names |
| Project summary and significance | Indirect cost, budget period |
| Status, sponsor logo (when licensed) | |

Do not add an `amount`, `grantNumber` or `collaborators` field to `_data/funding.json`
even "for reference" — the validator fails the build if one appears.

An award whose **official project title** is unknown stays `"publish": false`. A funding
mechanism alone ("NIH CTSA Pilot Award") tells a reviewer nothing about the science.

Sponsor logos: `showLogo: true` only when a logo file exists in `assets/` and its usage
terms allow it. Always give descriptive alt text and link the logo to the sponsor's site.
Never composite multiple institutional logos into one image.

---

## 5. Work modes

The user will name a mode. Follow it exactly.

### DRAFT
Add the content to `_data`, rebuild, but do not publish. Work on a branch, or set
`"publish": false`. No deployment, no pull request needed.

### PREVIEW
Edit `_data`, run `build.mjs` and `validate.mjs`, then report back: a summary of what
changed, the diff, and any validator warnings. Open a pull request. Do not merge.

### PUBLISH
Edit `_data`, rebuild, validate. If validation passes, commit to the production branch so
GitHub Actions deploys. Then confirm the live URL loads. If validation fails, stop and
report — never deploy a failing build.

### AUDIT
Read-only. Produce a report on stale, inconsistent, or missing content — outdated "upcoming"
events, awards in the CV but not on the site, held-back `publish: false` items, broken links,
missing meta descriptions. **Change nothing.**

Default when no mode is given: **PREVIEW** for anything on Home, About, Research, funding, or
publications; **PUBLISH** is acceptable for a news item, a new talk, or a typo fix.

---

## 6. Common tasks

**Add a talk** → `_data/speaking.json`, into the right `sections[].items[]` or
`groups[].items[]`. If it is a flagship talk, also add to `_data/home.json`
`featuredTalks`. Do not fill in audience size or evaluation scores.

**Add a news item** → `_data/news.json`, at the top of `items[]`, with `iso`
(`YYYY-MM-DD`) and `date` (`MMM DD, YYYY`). Newest first.

**Add a publication** → `_data/publications.json` with a stable `id` slug, `year`, `doi`,
`topics` (drives the on-page filter), and `tags`. To feature it on Home, add the `id` to
`_data/home.json` `featuredPublications`.

**Add a grant** → `_data/funding.json`. Re-read section 4 first.

**Add a lab member** → `_data/team.json` `members[]`. Photo optional; omit `photo` and an
initials placeholder renders. Formal tone, no emoji, `outsideLab` for the personal line.

**Add an image** → put the file in `assets/`, compress it, reference it from `_data`, and
always supply descriptive alt text.

**Change the nav, brand, or contact email** → `_data/site.json` only. It propagates to
every page, header, footer and sitemap.

**Retire a page** → add `"old.html": "new.html"` to `site.redirects` in `_data/site.json`
so the old URL keeps working.

---

## 7. Before every deployment

```bash
node _build/build.mjs
node _build/validate.mjs
```

`validate.mjs` checks: titles, meta descriptions, canonical domain, exactly one `<h1>`,
image alt text, JSON-LD parses, no placeholder markers, no `undefined`/`null` leaking into
output, broken internal links and anchors, DOI format, date format, news ordering,
rich-text allowlist, funding privacy contract, `featuredPublications` integrity, and
sitemap completeness.

Errors block deployment. Warnings are for a human to judge — report them, do not suppress them.

---

## 8. Related documents

- `CONTENT_GUIDE.md` — tone, naming conventions, what belongs on which page
- `SEO_GUIDE.md` — per-page SEO requirements and keyword ownership
- `DEPLOYMENT.md` — build, preview, deploy, rollback
