#!/usr/bin/env python3
"""
notify_slack.py
Sends one Slack Block Kit message per new CV item with Approve / Reject buttons.

Usage:
  python notify_slack.py --items new_items.json

Env vars required:
  SLACK_BOT_TOKEN   — xoxb-... bot token
  SLACK_CHANNEL     — e.g. #website-updates
  GITHUB_TOKEN      — PAT with repo + workflow scopes
  GITHUB_OWNER      — e.g. candicechudvm
  GITHUB_REPO       — e.g. candicechudvm.github.io
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.parse


SLACK_API = 'https://slack.com/api/chat.postMessage'

SECTION_EMOJI = {
    'publications': '📄',
    'talks':        '🎤',
    'teaching':     '🎓',
    'awards':       '🏆',
    'news':         '📰',
    'projects':     '🔬',
    'positions':    '🏛️',
}

SECTION_LABEL = {
    'publications': 'Publication',
    'talks':        'Talk / Lecture',
    'teaching':     'Teaching',
    'awards':       'Award',
    'news':         'News / Appointment',
    'projects':     'Project',
    'positions':    'Position',
}


def item_summary(section: str, item: dict) -> str:
    """Build a human-readable one-liner for the item."""
    if section == 'publications':
        year  = item.get('year', '')
        status = item.get('status', '')
        journal = item.get('journal', '')
        return f"*{item.get('title', '')}*\n_{item.get('authors', '')}_ — {journal}, {year} [{status}]"

    if section == 'talks':
        return (f"*{item.get('title', '')}*\n"
                f"{item.get('type','').title()} · {item.get('event','')} · "
                f"{item.get('location','')} ({item.get('year','')})")

    if section == 'teaching':
        return (f"*{item.get('course_code','')} {item.get('course_name','')}*\n"
                f"{item.get('role','').title()} · {item.get('institution','')} · "
                f"{item.get('semester','')} {item.get('year','')}")

    if section == 'awards':
        return f"*{item.get('title','')}*\n{item.get('organization','')} ({item.get('year','')})"

    if section == 'news':
        return f"*{item.get('headline','')}*\n{item.get('detail','')}"

    if section == 'projects':
        return (f"*{item.get('title','')}*\n"
                f"{item.get('description','')[:200]}{'…' if len(item.get('description','')) > 200 else ''}")

    if section == 'positions':
        return (f"*{item.get('title','')}*\n"
                f"{item.get('institution','')} · {item.get('year_start','')}–{item.get('year_end','')}")

    return json.dumps(item)


def build_blocks(section: str, item: dict, item_index: int) -> list:
    """Build Slack Block Kit blocks for one item."""
    emoji  = SECTION_EMOJI.get(section, '📋')
    label  = SECTION_LABEL.get(section, section.title())
    summary = item_summary(section, item)

    # Encode item as JSON string for the action value
    item_payload = json.dumps({'section': section, 'item': item, 'index': item_index})

    blocks = [
        {
            'type': 'header',
            'text': {'type': 'plain_text', 'text': f'{emoji}  New {label} Detected', 'emoji': True},
        },
        {
            'type': 'section',
            'text': {'type': 'mrkdwn', 'text': summary},
        },
        {'type': 'divider'},
        {
            'type': 'section',
            'text': {'type': 'mrkdwn', 'text': '_Add this to your website?_'},
            'accessory': None,  # removed — using actions block instead
        },
        {
            'type': 'actions',
            'elements': [
                {
                    'type': 'button',
                    'text': {'type': 'plain_text', 'text': '✅  Approve', 'emoji': True},
                    'style': 'primary',
                    'action_id': 'cv_approve',
                    'value': item_payload,
                },
                {
                    'type': 'button',
                    'text': {'type': 'plain_text', 'text': '❌  Reject', 'emoji': True},
                    'style': 'danger',
                    'action_id': 'cv_reject',
                    'value': item_payload,
                },
            ],
        },
    ]

    # Remove the None accessory section
    blocks = [b for b in blocks if not (b['type'] == 'section' and b.get('accessory') is None and '_Add this' in b.get('text', {}).get('text', ''))]
    blocks.insert(3, {
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': '_Add this to your website?_'},
    })

    return blocks


def post_to_slack(token: str, channel: str, blocks: list, text: str) -> None:
    payload = json.dumps({
        'channel': channel,
        'text': text,
        'blocks': blocks,
    }).encode()

    req = urllib.request.Request(
        SLACK_API,
        data=payload,
        headers={
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': f'Bearer {token}',
        },
        method='POST',
    )

    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read())
        if not body.get('ok'):
            print(f'  Slack error: {body.get("error")}', file=sys.stderr)
        else:
            print(f'  Posted to Slack: {body["ts"]}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--items', required=True)
    args = parser.parse_args()

    token   = os.environ.get('SLACK_BOT_TOKEN')
    channel = os.environ.get('SLACK_CHANNEL', '#website-updates')

    if not token:
        print('ERROR: SLACK_BOT_TOKEN not set', file=sys.stderr)
        sys.exit(1)

    with open(args.items) as f:
        new_items = json.load(f)

    if not new_items:
        print('No new items to notify about.')
        return

    total = sum(len(v) for v in new_items.values())
    print(f'Sending {total} Slack notification(s)...')

    # Post a summary header first
    summary_lines = [f'*🔔 Chu Lab CV Sync — {total} new item(s) detected*']
    for section, items in new_items.items():
        emoji = SECTION_EMOJI.get(section, '📋')
        summary_lines.append(f'• {emoji} {len(items)} {SECTION_LABEL.get(section, section)} item(s)')
    summary_lines.append('\n_Review each item below:_')

    post_to_slack(token, channel, [
        {'type': 'section', 'text': {'type': 'mrkdwn', 'text': '\n'.join(summary_lines)}}
    ], text='CV updated — new items for review')

    # Post one message per item
    idx = 0
    for section, items in new_items.items():
        for item in items:
            label = SECTION_LABEL.get(section, section)
            text  = f'New {label}: {item.get("title") or item.get("course_name") or item.get("headline", "")}'
            blocks = build_blocks(section, item, idx)
            post_to_slack(token, channel, blocks, text)
            idx += 1

    print('All notifications sent.')


if __name__ == '__main__':
    main()
