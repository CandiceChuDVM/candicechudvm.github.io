#!/usr/bin/env python3
"""
download_from_drive.py
Downloads the CV PDF from Google Drive using a service account.

Requires env vars:
  GDRIVE_SERVICE_ACCOUNT_JSON  — full JSON string of the service account key
  DRIVE_FILE_ID                — Google Drive file ID
"""

import json
import os
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
OUTPUT_PATH = 'cv_download.pdf'


def main():
    sa_json = os.environ.get('GDRIVE_SERVICE_ACCOUNT_JSON')
    file_id = os.environ.get('DRIVE_FILE_ID')

    if not sa_json:
        print('ERROR: GDRIVE_SERVICE_ACCOUNT_JSON not set', file=sys.stderr)
        sys.exit(1)
    if not file_id:
        print('ERROR: DRIVE_FILE_ID not set', file=sys.stderr)
        sys.exit(1)

    sa_info = json.loads(sa_json)
    credentials = service_account.Credentials.from_service_account_info(
        sa_info, scopes=SCOPES
    )

    service = build('drive', 'v3', credentials=credentials)
    request = service.files().get_media(fileId=file_id)

    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
        print(f'Download progress: {int(status.progress() * 100)}%')

    with open(OUTPUT_PATH, 'wb') as f:
        f.write(fh.getvalue())

    print(f'CV saved to {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH)} bytes)')


if __name__ == '__main__':
    main()
