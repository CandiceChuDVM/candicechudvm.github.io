# SEO guide

Canonical domain: **https://candicechudvm.com** — every canonical URL, `og:url` and sitemap
entry must use it. No `www`, no trailing `index.html`, no `github.io` URLs in canonical tags.

All of the following are emitted automatically by `_build/render.mjs`. This document says
what the *content* of each field must be, and `_build/validate.mjs` enforces the mechanics.

## Every page must have

| Element | Requirement |
| --- | --- |
| `<title>` | Unique. ≤ 65 characters. Primary keyword first, then `\| Candice Chu` or a page qualifier. |
| `<meta name="description">` | Unique. 70–175 characters. Answer-first: what the page *is*, not "welcome to". |
| `<link rel="canonical">` | Absolute, on the canonical domain. |
| `<h1>` | Exactly one. Contains the page's primary keyword. Never the same string as another page's `<h1>`. |
| Open Graph | `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt`, `og:site_name`, `og:locale`. |
| Twitter card | `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`. |
| Crawler directives | `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">` and `<meta name="author">`. |
| Image alt text | Descriptive, states what is shown. Empty `alt=""` only for purely decorative art. |
| JSON-LD | `Person` on every page, plus a page-appropriate type where one fits. |
| Internal links | At least two outbound internal links from body content. |

## Keyword ownership

Each page owns a keyword cluster. Do not compete against yourself by targeting the same
head term from two pages.

| Page | Primary | Supporting |
| --- | --- | --- |
| Home | Candice Chu veterinary AI | veterinary artificial intelligence, digital cytology, AI education, veterinary clinical pathologist |
| Research | veterinary diagnostic AI | digital cytology research, canine lymphoma AI, veterinary informatics, urinary microRNA biomarkers |
| AI Education | veterinary AI literacy | AI curriculum veterinary education, VTPB 948, prompt engineering for veterinarians, AI ethics veterinary |
| VetClinPathGPT | VetClinPathGPT | veterinary clinical pathology AI tutor, veterinary pathology chatbot, AI tutor for veterinary students, veterinary case-based learning |
| Publications | Candice Chu publications | veterinary AI publications, urinary microRNA CKD, single-cell RNA sequencing canine kidney |
| Speaking | veterinary AI keynote speaker | AI in veterinary medicine talk, veterinary AI literacy lecture, digital cytology speaker |
| Team | Chu Lab team | veterinary AI graduate research, BIMS graduate program |
| About | Candice Chu DVM PhD DACVP | veterinary clinical pathologist Texas A&M, pathology informatics leadership |
| Teaching | veterinary clinical pathology teaching | cytology webinars, veterinary AI tutorials |

## Structured data

| Page | JSON-LD types |
| --- | --- |
| All | `Person` (name, credentials, jobTitle, affiliation, knowsAbout, sameAs) |
| `index.html` | `WebSite` (name, url, inLanguage, author, publisher, about) — ties the domain to the person entity |
| `publications.html` | `ItemList` of `ScholarlyArticle`, each with `sameAs` = the DOI URL |
| `ai-education.html` | `Course` (VTPB 948) with `provider` and `instructor` |
| `vetclinpathgpt.html` | `SoftwareApplication`, `isAccessibleForFree: true` |

Add types only where they describe something real on the page. Do not add `Review`,
`AggregateRating`, or `Event` markup for things that have not happened or been rated.

## Writing for AI and search summarisation

- **Answer first.** Open each page with one sentence that fully answers "what is this."
  Summarisers quote the first paragraph.
- **Prefer HTML to PDF.** Course schedules, publication lists and curricula must be real
  HTML tables and lists. A linked PDF is a dead end for both search engines and AI readers.
- **Keep headings honest.** An `<h2>` should name what follows so a machine can extract the
  section cleanly.
- Use real `<table>` markup with `<th scope>` for tabular data, not styled `<div>`s.
- Attribute reused scholarly content: *"Adapted from Huang and Chu, 2026, under the Creative
  Commons Attribution License."*

## llms.txt

`llms.txt` at the domain root is a plain-text map of the site for AI assistants and answer
engines: who she is, how she should be named, every page URL, areas of expertise, off-site
profiles, and how to cite the work. It is generated from `_data/site.json`, so it cannot
drift from the pages. If a page is added to `nav`, it appears there automatically —
never hand-edit `llms.txt`.

## Sitemap and robots

Both are generated. `sitemap.xml` lists every page including the secondary ones (`cv.html`,
`news.html`, `teaching.html`) with `lastmod` set at build time. Retired URLs are served as
redirect stubs carrying `<meta name="robots" content="noindex, follow">` plus a canonical
pointing at the new page — they are deliberately excluded from the sitemap.

`robots.txt` allows all crawlers and then names the major answer-engine agents explicitly
(GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, Google-Extended,
Applebot-Extended) so citation in AI answers is opt-in by intent, not by omission. To *block*
an agent later, change its `Allow: /` to `Disallow: /` in `renderRobots` — not in the file.

## Do not

- Keyword-stuff. Each keyword appears naturally, not on a quota.
- Duplicate meta descriptions between pages.
- Publish an "upcoming" event that has already happened — move it to the past record.
- Point a canonical URL at a page that does not exist.
- Publish a page with fewer than roughly 150 words of real content.
