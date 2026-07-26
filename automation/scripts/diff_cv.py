#!/usr/bin/env python3
"""
diff_cv.py
Compares newly parsed CV JSON against the current site_data.json
to find items that are new or updated.

Usage:
  python diff_cv.py --new parsed_cv.json --current automation/data/site_data.json --output new_items.json
"""

import argparse
import json
import os


def normalize_title(t: str) -> str:
    """Lowercase, strip punctuation for fuzzy matching."""
    import re
    return re.sub(r'[^a-z0-9 ]', '', (t or '').lower()).strip()


def diff_section(new_items: list, current_items: list, title_key: str = 'title') -> list:
    """Return items in new_items that are not already in current_items."""
    current_titles = {normalize_title(item.get(title_key, '')) for item in current_items}
    added = []
    for item in new_items:
        norm = normalize_title(item.get(title_key, ''))
        if norm and norm not in current_titles:
            added.append(item)
    return added


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--new',     required=True)
    parser.add_argument('--current', required=True)
    parser.add_argument('--output',  required=True)
    args = parser.parse_args()

    with open(args.new) as f:
        new_cv = json.load(f)

    # current data may not exist yet (first run)
    if os.path.exists(args.current):
        with open(args.current) as f:
            current = json.load(f)
    else:
        current = {}

    sections = {
        'publications': 'title',
        'talks':        'title',
        'teaching':     'course_name',
        'awards':       'title',
        'news':         'headline',
        'projects':     'title',
        'positions':    'title',
    }

    result = {}
    total_new = 0
    for section, title_key in sections.items():
        new_items    = new_cv.get(section, [])
        current_items = current.get(section, [])
        added = diff_section(new_items, current_items, title_key)
        if added:
            result[section] = added
            total_new += len(added)
            print(f'  {section}: {len(added)} new item(s)')

    print(f'Total new items found: {total_new}')

    with open(args.output, 'w') as f:
        json.dump(result, f, indent=2)
    print(f'Diff saved to {args.output}')


if __name__ == '__main__':
    main()
