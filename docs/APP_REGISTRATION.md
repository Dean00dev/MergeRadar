# GitHub App registration

Do this **after** MergeRadar is deployed to a stable HTTPS URL.

## Core URLs

Assume the deployment is `https://app.example.com`.

- Homepage URL: `https://app.example.com`
- Webhook URL: `https://app.example.com/webhook`
- Setup URL: `https://app.example.com/installed`
- Callback URL: **not required for v0.1** because MergeRadar does not request user authorization.

Keep webhook SSL verification enabled.

## Repository permissions

Request only:

- **Checks — Read & write**
- **Contents — Read-only**
- **Pull requests — Read-only**

Do not request Administration, Actions, Workflows, Issues, Members, Secrets or repository Contents write access for the v0.1 core.

## Events

Subscribe to:

- `pull_request`
- `installation`
- `installation_repositories`

The core analyzer reacts to PR actions:

- opened
- reopened
- synchronize
- ready_for_review

Other PR actions are accepted and ignored.

When a Marketplace listing is created, configure delivery of `marketplace_purchase` events to the same verified webhook processing service.

## Installation scope

The public Marketplace app must ultimately be installable on any account. During development, keep the app private or restricted until webhook security and deployment are ready.

## Secrets

Generate:

- a GitHub App private key;
- a high-entropy webhook secret.

Store them outside the repository.

Environment variables:

```text
GITHUB_APP_ID
GITHUB_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET
APP_URL
DATA_FILE
```

`GITHUB_PRIVATE_KEY` accepts either a literal PEM or a string whose newlines are encoded as `\n`.

## First smoke test

1. Install the development app on a test repository.
2. Open a PR that changes only `README.md`.
3. Confirm MergeRadar creates a low-impact check.
4. Push a change under `.github/workflows/`.
5. Confirm the next head SHA gets a high-impact check.
6. Add CODEOWNERS and verify coverage is reported.
7. Redeliver the exact webhook delivery and confirm the in-process duplicate cache suppresses it.

Do not use the development app on repositories whose data-retention expectations have not been reviewed.
