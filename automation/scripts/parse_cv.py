#!/usr/bin/env python3
"""
parse_cv.py
Extracts text from CV PDF and uses Claude to parse it into structured JSON.

Usage:
  python parse_cv.py --cv cv_download.pdf --output parsed_cv.json

Output JSON structure:
{
  "publications": [...],
  "talks": [...],
  "teaching": [...],
  "awards": [...],
  "news": [...],
  "projects": [...],
  "education": [...],
  "positions": [...]
}
"""

import argparse
import json
import os
import sys

import anthropic
from pypdf import PdfReader


EXTRACTION_PROMPT = """You are a precise academic CV parser. Extract ALL items from the following CV text and return a single valid JSON object with these keys:

- publications: list of {title, authors, journal, year, doi, status}
  status is one of: "published", "in_press", "submitted", "in_revision"
- talks: list of {title, event, location, year, month, type}
  type is one of: "keynote", "invited", "oral", "poster", "panelist"
- teaching: list of {course_code, course_name, institution, year, semester, role}
  role is one of: "instructor", "co-instructor", "guest_lecturer", "ta"
- awards: list of {title, organization, year}
- news: list of {headline, detail, year, month}
  Only include appointments, grants, nominations, and featured media — not talks/pubs already captured above
- projects: list of {title, description, status, funding_source, collaborators}
  status: "active", "completed", "proposed"
- education: list of {degree, field, institution, year_start, year_end}
- positions: list of {title, institution, department, year_start, year_end}
  year_end is "present" if current

Rules:
- Return ONLY the JSON object — no markdown, no explanation, no code fences
- Use null for missing fields, never omit the key
- Dates: use integers for years (e.g. 2024), strings for months (e.g. "March")
- For authors, list full names as they appear; use "et al." only if genuinely truncated in the original
- If a section does not exist in the CV, return an empty array []

CV TEXT:
---
{cv_text}
---"""


def extract_pdf_text(pdf_path: str) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(pdf_path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ''
        pages.append(f"[Page {i + 1}]\n{text}")
    return '\n\n'.join(pages)


def parse_with_claude(cv_text: str, api_key: str) -> dict:
    """Send CV text to Claude and get structured JSON back."""
    client = anthropic.Anthropic(api_key=api_key)

    prompt = EXTRACTION_PROMPT.format(cv_text=cv_text)

    # Use a large context model; the CV can be long
    message = client.messages.create(
        model='claude-opus-4-5',
        max_tokens=8192,
        messages=[{'role': 'user', 'content': prompt}],
    )

    raw = message.content[0].text.strip()

    # Strip any accidental markdown fences
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1]
        raw = raw.rsplit('```', 1)[0]

    return json.loads(raw)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cv',     required=True, help='Path to CV PDF')
    parser.add_argument('--output', required=True, help='Path for output JSON')
    args = parser.parse_args()

    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print('ERROR: ANTHROPIC_API_KEY not set', file=sys.stderr)
        sys.exit(1)

    print(f'Extracting text from {args.cv}...')
    cv_text = extract_pdf_text(args.cv)
    print(f'Extracted {len(cv_text)} characters across {cv_text.count("[Page ")} pages.')

    print('Sending to Claude for structured extraction...')
    data = parse_with_claude(cv_text, api_key)

    counts = {k: len(v) for k, v in data.items()}
    print('Extracted items:', json.dumps(counts, indent=2))

    with open(args.output, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'Saved parsed CV to {args.output}')


if __name__ == '__main__':
    main()
