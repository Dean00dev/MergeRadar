# Threat model

## Assets

- GitHub App private key;
- webhook secret;
- installation access tokens;
- Marketplace entitlement state;
- private repository path metadata and CODEOWNERS contents visible to an installation.

## Attacker goals

- forge webhook events;
- trigger unauthorized GitHub API actions;
- steal app credentials;
- cause duplicate or resource-exhausting work;
- poison impact output with crafted repository paths or CODEOWNERS content;
- infer private repository information from logs.

## Controls in v0.1

- HMAC SHA-256 verification before JSON processing;
- constant-time signature comparison;
- 2 MiB webhook body limit;
- bounded in-memory delivery replay cache;
- short-lived GitHub installation tokens;
- minimal GitHub App permissions;
- no repository code execution;
- no shelling out during webhook processing;
- path classification is data-only;
- atomic file replacement for entitlement state;
- response headers disable content sniffing and caching.

## Known limits

- delivery replay state is not durable across restarts;
- the JSON store is single-instance infrastructure;
- no distributed rate limiter;
- no external queue;
- no automatic secret rotation;
- no tenant-isolated database;
- CODEOWNERS parsing is a bounded common subset;
- logs must be shipped/configured carefully by the operator to avoid retaining sensitive data.

These are deployment-hardening items, not hidden assurances.
