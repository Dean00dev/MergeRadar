# MergeRadar v0.1.0 — Deterministic Change Impact

MergeRadar v0.1.0 is the first public release of a GitHub App core that maps pull-request changes to explainable repository authority surfaces before merge.

## Highlights

- deterministic `low`, `moderate`, and `high` change-impact routing;
- authentication, CI/CD, database, infrastructure, dependency, API, security-policy, agent-instruction and build-system surfaces;
- GitHub Check output with explicit reasoning;
- bounded CODEOWNERS coverage and unowned-sensitive-path reporting;
- minimal GitHub App permission design;
- HMAC-verified webhooks;
- Marketplace purchase-event normalization;
- zero runtime dependencies;
- Docker deployment and cross-platform Node 20/24 CI.

## Core boundary

A successful MergeRadar check means the analysis completed. It does not certify that code is safe, secure, compliant, correct or ready to merge.

## Commercial boundary

v0.1.0 is free/open-source core infrastructure. Paid Marketplace plans are not enabled in this release.
