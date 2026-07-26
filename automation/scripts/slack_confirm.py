#!/usr/bin/env python3
"""
slack_confirm.py
Posts a confirmation message back to Slack after an item is applied.

Usage:
  python slack_confirm.py --response-url <url> --section <section>

Env vars:
  SLACK_BOT_TOKEN
"""

import argparse
import json
import os
import sys
import urllib.request


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--response-url', default='')
    parser.add_argument('--section',      required=True)
    args = parser.parse_args()

    section = args.section.replace('_', ' ').title()
    msg = {
        'replace_original': True,
        'text': f'✅ *{section}* item approved and added to the website!',
        'blocks': [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': f'✅ *{section}* item has been approved and committed to the website repository.',
                },
            },
            {
                'type': 'context',
                'elements': [
                    {
                        'type': 'mrkdwn',
                        'text': '🤖 Committed by Chu Lab Bot · Changes will be live on GitHub Pages within ~1 minute.',
                    }
                ],
            },
        ],
    }

    if args.response_url:
        payload = json.dumps(msg).encode()
        req = urllib.request.Request(
            args.response_url,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        try:
            with urllib.request.urlopen(req) as resp:
                print(f'Slack confirmation sent: {resp.status}')
        except Exception as e:
            print(f'Warning: could not send confirmation: {e}', file=sys.stderr)
    else:
        # Fallback: post via chat.postMessage to channel
        token   = os.environ.get('SLACK_BOT_TOKEN')
        channel = os.environ.get('SLACK_CHANNEL', '#website-updates')
        if token:
            msg['channel'] = channel
            payload = json.dumps(msg).encode()
            req = urllib.request.Request(
                'https://slack.com/api/chat.postMessage',
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {token}',
                },
                method='POST',
            )
            with urllib.request.urlopen(req) as resp:
                print(f'Slack fallback confirmation: {json.loads(resp.read()).get("ok")}')


if __name__ == '__main__':
    main()
