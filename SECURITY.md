# Security Policy

## Supported version

The current `main` branch and latest tagged release are supported during the pre-Marketplace development period.

## Reporting a vulnerability

Do not disclose exploitable vulnerabilities in a public issue.

Use GitHub's private vulnerability reporting feature if enabled for this repository. If it is not available, contact the repository owner privately through the contact method published on the GitHub profile before sharing technical details publicly.

## Security posture

MergeRadar:

- verifies webhook HMAC signatures;
- requests narrowly scoped GitHub App permissions;
- never needs repository Contents write access;
- does not execute repository code;
- uses short-lived installation tokens;
- keeps GitHub App credentials outside the repository.

Read `docs/THREAT_MODEL.md` for known limits.
