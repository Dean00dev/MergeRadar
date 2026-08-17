# Impact model

MergeRadar's impact model is intentionally simple, deterministic and inspectable.

## What an impact level means

An impact level answers:

> Which configured repository authority surfaces did this pull request touch, and which review lanes may deserve attention?

It does **not** answer:

- Is the code vulnerable?
- Is the change malicious?
- Will the deployment fail?
- Is the PR safe to merge?
- What is the probability of an incident?
- How severe would an incident be?

## Tiers

Tier 3 surfaces are areas where a small path-level change can alter high-consequence repository or runtime authority:

- authentication / authorization;
- CI/CD authority;
- database schema / migration;
- infrastructure / runtime.

Tier 2 surfaces frequently alter contracts, dependencies or governance:

- dependency graph;
- public API contract;
- security / ownership policy;
- coding-agent instructions;
- build / packaging.

No configured match is `low`. At least one tier-2 match is `moderate`. At least one tier-3 match is `high`.

There is no `critical` category in v0.1 because the engine does not inspect semantics deeply enough to justify one.

## Pattern philosophy

Rules are path based and intentionally visible in `src/rules.js`.

A file may match more than one surface. MergeRadar preserves all matches instead of forcing one category.

## CODEOWNERS

CODEOWNERS is supplementary evidence. MergeRadar reports which changed paths are matched by its bounded parser and which sensitive paths appear unowned under that parser.

Unsupported pattern syntax is diagnosed and skipped rather than silently approximated.

GitHub remains authoritative for actual CODEOWNERS behavior.
