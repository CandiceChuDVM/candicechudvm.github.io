# automation/ — inactive prototype

This folder holds an earlier, **unwired** experiment: a pipeline meant to parse the CV PDF
from Drive, ask for approval over Slack, and patch `automation/data/site_data.json`.

It is not connected to anything:

- `automation/workflows/*.yml` are **not** in `.github/workflows/`, so GitHub Actions never
  runs them.
- `automation/data/site_data.json` is empty and no page reads it.

## Authoritative source of content

`_data/*.json` at the repository root. See `AGENTS.md`.

Do **not** write site content into `automation/data/site_data.json` — nothing renders it, and
having two content stores is exactly the failure mode `_data/` was created to remove.

## If you want to revive the CV-sync idea

Point it at `_data/*.json` instead, move the workflow files into `.github/workflows/`, and
make it open a pull request rather than committing directly — the approval step belongs in
the pull request, not in a chat message. Until then, treat this folder as reference material.
