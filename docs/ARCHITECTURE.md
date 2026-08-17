# Architecture

```text
GitHub webhook
    |
    v
HMAC verification
    |
    v
event dispatcher
    |
    +--> marketplace_purchase --> atomic JSON entitlement/event store
    |
    +--> pull_request
            |
            +--> GitHub App JWT
            +--> installation token
            +--> changed files
            +--> CODEOWNERS at base SHA
            |
            v
        deterministic impact engine
            |
            v
        GitHub Check Run
```

## Trust boundaries

### GitHub webhook input

Untrusted until the `X-Hub-Signature-256` HMAC is verified.

### Repository paths and CODEOWNERS

Untrusted data. MergeRadar treats them as strings and never executes repository content.

### GitHub App private key

High-value secret. It must remain outside source control and should be stored in the deployment platform's secret manager.

### Marketplace entitlement storage

The included JSON store is durable for a single-instance MVP with persistent disk. It is not a horizontally scalable database. Before multi-instance production, replace it with a transactional data store behind the same normalization boundary.

## Why zero runtime dependencies

The v0.1 service uses Node's standard library for:

- HTTP serving;
- HMAC verification;
- RSA signing;
- JSON persistence;
- outbound GitHub API calls through native `fetch`.

This keeps the initial software-supply-chain surface small. It is not a claim that dependency-free code is automatically secure.

## Async webhook processing

The server verifies and acknowledges valid webhooks before network-heavy analysis completes. Processing failures are logged.

At-least-once delivery can create duplicate work across process restarts. v0.1 suppresses duplicates in memory only. Durable idempotency is on the production-hardening roadmap.
