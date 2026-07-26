repo: CandiceChuDVM/candicechudvm.github.io
branch: main

## Last sync

date: 2026-07-26T01:30:17Z

### Updated in this project

- Read-only inspection of the existing repo: it currently holds the al-folio Jekyll theme (`_config.yml`, `_pages/`, `_posts/`, `_sass/`, Gemfile, Docker files).
- This project's site is a static, data-driven build (`_data/*.json` → `_build/render.mjs` → HTML) and is intended to REPLACE the al-folio contents on `main`.
- Added `.nojekyll` so GitHub Pages serves the generated HTML directly instead of running Jekyll.
- Nothing has been pushed: the GitHub connection here is read-only.

## Screen map

| Project screen | Repo files (superseded) |
| --- | --- |
| index.html | _pages/about.md |
| research.html | _projects/*.md |
| ai-education.html | _teaching/*.md |
| vetclinpathgpt.html | _projects/2_project_research_vetclinpathgpt.md |
| publications.html | _pages/publications.md, _bibliography |
| speaking.html | _pages/talks.md, _talks/*.md |
| team.html | _pages/profiles.md, _pages/about_franklin.md, _pages/about_yumi.md |
| about.html | _pages/about.md, _pages/cv.md, _data/cv.yml |
| news.html | _news/announcement_*.md |
