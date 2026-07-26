#!/usr/bin/env python3
"""
apply_change.py
Merges a single approved item into automation/data/site_data.json.

Usage:
  python apply_change.py --item '{"title":...}' --section publications --data automation/data/site_data.json
"""

import argparse
import json
import os
import sys
from datetime import datetime


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--item',    required=True, help='JSON string of the approved item')
    parser.add_argument('--section', required=True)
    parser.add_argument('--data',    required=True, help='Path to site_data.json')
    args = parser.parse_args()

    # Parse item
    try:
        item = json.loads(args.item)
    except json.JSONDecodeError as e:
        print(f'ERROR: could not parse --item JSON: {e}', file=sys.stderr)
        sys.exit(1)

    # Load existing data
    if os.path.exists(args.data):
        with open(args.data) as f:
            data = json.load(f)
    else:
        data = {}

    section = args.section
    if section not in data:
        data[section] = []

    # Add approved_at timestamp
    item['_approved_at'] = datetime.utcnow().isoformat() + 'Z'

    # Prepend so newest items appear first
    data[section].insert(0, item)

    # Write back
    os.makedirs(os.path.dirname(args.data), exist_ok=True)
    with open(args.data, 'w') as f:
        json.dump(data, f, indent=2)

    title = item.get('title') or item.get('course_name') or item.get('headline') or '(untitled)'
    print(f'Added to [{section}]: {title}')


if __name__ == '__main__':
    main()
