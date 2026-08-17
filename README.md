# MergeRadar

> **Know what a pull request can affect before you merge it.**

MergeRadar is a deterministic GitHub App that turns a pull request's changed paths into an explainable **change-impact map**. It helps reviewers see when a PR touches authentication, CI/CD authority, database migrations, infrastructure, dependencies, public APIs, security policy, or coding-agent instructions.

It deliberately does **not** use an LLM to decide whether a change is safe.

```text
MergeRadar / Change Impact

Impact: HIGH • 4 surfaces

Authentication / authorization   tier 3   security
CI/CD authority                  tier 3   platform
Dependency graph                 tier 2   maintainers
Coding-agent instructions        tier 2   maintainers

CODEOWNERS: 7/8 changed paths matched
Unowned sensitive paths: 1
```

A green MergeRadar check means **the analysis completed**. It is not a security certificate, vulnerability scan, exploitability score, or guarantee that a pull request is safe to merge.

## Why

Large pull requests hide important context in plain sight. A five-line edit to an authentication path can matter more than a thousand-line documentation change. Teams also increasingly maintain multiple sources of repository authority: workflows, migrations, ownership policy, dependency manifests, infrastructure and AI-agent instruction files.

MergeRadar makes those surfaces visible before merge.

## v0.1.0

The first release includes:

- deterministic path-based impact classification;
- `low`, `moderate`, and `high` attention levels;
- explicit review-lane suggestions;
- standard-location CODEOWNERS discovery and bounded common-pattern coverage analysis;
- GitHub Check output on pull requests;
- explicit `incomplete` handling when GitHub's Pull Files API reaches its 3,000-file response ceiling;
- webhook HMAC verification and duplicate-delivery suppression;
- GitHub App JWT and installation-token authentication with no runtime dependencies;
- Marketplace purchase-event normalization and durable JSON entitlement/event storage;
- Docker deployment;
- Node 20+ support and cross-platform CI;
- threat model, privacy, support, Marketplace and registration documentation.

## Impact surfaces

| Surface | Tier | Suggested review lane |
| --- | ---: | --- |
| Authentication / authorization | 3 | security |
| CI/CD authority | 3 | platform |
| Database schema / migration | 3 | database |
| Infrastructure / runtime | 3 | platform |
| Dependency graph | 2 | maintainers |
| Public API contract | 2 | api |
| Security / ownership policy | 2 | security |
| Coding-agent instructions | 2 | maintainers |
| Build / packaging | 2 | maintainers |

The tiers are **review-routing categories**, not probabilities or vulnerability severity scores. See [`docs/IMPACT_MODEL.md`](docs/IMPACT_MODEL.md).

## GitHub App permissions

MergeRadar's core PR analysis is intentionally narrow.

Repository permissions:

- **Checks: Read & write** — create the MergeRadar check run.
- **Contents: Read-only** — read CODEOWNERS from the PR base revision.
- **Pull requests: Read-only** — receive PR activity and list changed files.

Core webhook subscription:

- `pull_request`

Useful lifecycle events:

- `installation`
- `installation_repositories`

Marketplace purchase events are configured when the Marketplace listing is created.

See [`docs/APP_REGISTRATION.md`](docs/APP_REGISTRATION.md) before registering the app.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm test
npm run verify
npm start
```

Environment:

```bash
export GITHUB_APP_ID="123456"
export GITHUB_PRIVATE_KEY="$(cat private-key.pem)"
export GITHUB_WEBHOOK_SECRET="replace-me"
export APP_URL="https://mergeradar.example.com"
export DATA_FILE="./data/mergeradar.json"
npm start
```

Health check:

```bash
curl http://localhost:3000/healthz
```

Webhook endpoint:

```text
POST /webhook
```

The server verifies `X-Hub-Signature-256` before parsing or processing the payload.

## Deployment

A minimal container image is included:

```bash
docker build -t mergeradar .
docker run --rm -p 3000:3000 \
  -e GITHUB_APP_ID \
  -e GITHUB_PRIVATE_KEY \
  -e GITHUB_WEBHOOK_SECRET \
  -v "$PWD/data:/app/data" \
  mergeradar
```

For a public Marketplace deployment, use TLS at the edge, persistent storage for `DATA_FILE`, secret management for the private key and webhook secret, logs/alerts, backups, and more than one availability zone or an equivalent hosting strategy before claiming production resilience.

## Free → paid path

**Free first.** The free product should earn installations because it is useful on its own.

Planned free tier:

- change-impact checks;
- standard impact surfaces;
- CODEOWNERS coverage;
- public and private repository support within a sensible operational allowance.

Potential future paid capabilities:

- organization-wide custom policy packs;
- cross-repository impact mapping;
- historical impact analytics;
- centralized ownership-gap dashboards;
- reusable organization baselines and routing policy.

Paid plans are **not enabled in v0.1.0**. Marketplace requirements and the commercial boundary are documented in [`docs/MARKETPLACE.md`](docs/MARKETPLACE.md).

## Security boundary

MergeRadar reads repository metadata and CODEOWNERS. It does not execute repository code and does not need write access to repository contents.

Read [`SECURITY.md`](SECURITY.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## CODEOWNERS boundary

MergeRadar v0.1 uses a deliberately bounded parser for common CODEOWNERS patterns. Unsupported constructs are surfaced as diagnostics instead of guessed. GitHub remains authoritative for actual CODEOWNERS enforcement.

## Large pull requests

GitHub's Pull Files API returns at most 3,000 files. If MergeRadar reaches that ceiling it returns **INCOMPLETE** with a neutral check instead of silently presenting a low/moderate/high verdict from partial evidence.

## Privacy

MergeRadar is designed to minimize retained data. The v0.1 service stores normalized Marketplace entitlement events only. Pull-request analysis is computed from GitHub API responses and is not persisted by default.

See [`PRIVACY.md`](PRIVACY.md).

## License

MIT. The open-source core is intentionally easy to inspect and self-host. Future paid value is expected to come from hosted organization-scale coordination, analytics and policy management rather than hiding the basic impact engine.

---

**MergeRadar makes change authority visible. It does not pretend visibility is proof of safety.**
