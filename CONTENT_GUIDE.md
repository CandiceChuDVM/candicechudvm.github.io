# Content guide

## Voice

Precise, plain, and confident without selling. The audience is research collaborators, grant
reviewers, specialty colleges, and prospective graduate students — plus veterinarians looking
for practical AI guidance. Write for someone who will check your claims.

- Prefer the concrete over the impressive. "Recovered over 13,000 cells and identified 11 cell
  types" beats "cutting-edge single-cell analysis."
- Never use: revolutionary, groundbreaking, world-class, leading expert, transformative
  (except when quoting a published title), passionate about, leverage synergies.
- Say what a project *does* and what would change if it worked. Avoid stating impact that has
  not been demonstrated.
- Sentence-case headings. American English. Oxford comma.
- No emoji outside `_data/news.json`.

## Naming conventions

| Thing | Write it as |
| --- | --- |
| Name, first mention | Candice P. Chu, DVM, PhD, DACVP |
| Name, later mentions | Dr. Chu |
| Degrees | DVM, PhD, DACVP — no periods inside, comma-separated |
| Board certification | Diplomate, American College of Veterinary Pathologists (Clinical Pathology) |
| Institution | Texas A&M University |
| College | College of Veterinary Medicine & Biomedical Sciences |
| Department | Department of Veterinary Pathobiology |
| Never | "TAMU CVM" in body copy; "A&M" alone; "Texas A and M" |
| Prior institution | University of Pennsylvania School of Veterinary Medicine (not "Penn Vet" on first mention) |
| Organisations | Spell out on first use per page, then abbreviate: American College of Veterinary Pathologists (ACVP) |
| The lab | "the Chu Lab" or "the lab" — lowercase "lab" |

Dates: `Apr 21, 2025` for display, `2025-04-21` for the `iso` sort key. Academic terms:
`Spring 2026`, `Fall 2025`.

## Research pillars

All research belongs to exactly one of three pillars in `_data/research.json`. Do not
invent a fourth without asking.

1. **Diagnostic AI and Digital Cytology** — image AI, cytology, clinical validation,
   image datasets, model validation.
2. **Large Language Models and Veterinary Informatics** — record extraction, AI scribes,
   LLM evaluation, hallucination and error analysis, data governance.
3. **Molecular and Precision Diagnostics** — microRNA, extracellular vesicles, RNA-seq,
   single-cell sequencing, digital cytometry, comparative nephrology.

## What belongs on which page

| Page | Purpose | Do not put here |
| --- | --- | --- |
| `index.html` (Home) | Identity, three flagship programs, selected impact, funded research, latest of everything | Complete lists of anything |
| `research.html` | Three pillars, every active project, funded research | Teaching, curriculum |
| `ai-education.html` | Curriculum framework, VTPB 948, hands-on work, educational evidence, open resources | Diagnostic model development |
| `vetclinpathgpt.html` | The tutor: what it is, who for, how to use, educational research | General AI-in-vet-med commentary |
| `publications.html` | Every publication, filterable by topic | Abstracts and conference posters |
| `speaking.html` | Keynote topics, invitation CTA, talk record including abstracts | Courses |
| `team.html` | Current members, alumni, how to join | Mentored residents (CV only) |
| `about.html` | Biography, leadership, education, honors, contact | Project detail |
| `teaching.html` | Secondary: courses, webinars, YouTube, podcasts | The curriculum framework |
| `news.html` | Dated updates, newest first | Anything undated |

Home shows **three to five** items per section and links out. It is not a CV.

## Facts you may not infer

Never write these unless the user supplies them or they are in the CV:

- Award amounts, grant numbers, budget periods, collaborator names
- Audience size, attendance figures, evaluation scores
- Student quotations (also require institutional clearance before publishing)
- Model accuracy, sensitivity, specificity, or any performance metric
- Dataset size, number of annotated images, number of cases
- Publication status beyond what `_data/publications.json` records
- Institutional adoption or uptake of any tool
- Dates or venues for talks that are not yet confirmed

If it would look good on the site and you are not certain of it, that is exactly the case
where you ask.

## Student and trainee content

Lab member bios are written in third person, formally, with an `outsideLab` line for
personality. Get the person's approval before publishing a bio or photo. Omit `photo` to
render an initials placeholder rather than a broken image.

## Repetition

The same fact may appear on at most two pages, worded differently each time. If Home,
About, and Research all need the same sentence, put the full version in one place and
summarise plus link from the others.
