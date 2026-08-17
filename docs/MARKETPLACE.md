# GitHub Marketplace plan

## Product sentence

**MergeRadar shows which high-consequence repository surfaces a pull request changes before you merge it.**

## Free listing target

The free service should be useful without an upgrade prompt.

Proposed free capabilities:

- deterministic PR change-impact check;
- standard impact surfaces;
- review-lane suggestions;
- bounded CODEOWNERS coverage;
- installation on selected repositories;
- no model/API dependency.

## Future paid direction

Do not enable paid plans until the app has earned real usage and the publisher satisfies GitHub's paid-listing requirements.

Potential hosted Pro/Team value:

- custom organization policy packs;
- cross-repository dependency/impact maps;
- historical analytics;
- organization-wide ownership-gap dashboards;
- centrally managed review-routing baselines;
- longer evidence retention and export.

The open-source impact engine remains useful; paid value should come from hosted coordination at organization scale.

## Marketplace event handling

`marketplace_purchase` payloads are normalized in `src/marketplace.js` and written atomically through `src/store.js`.

The code intentionally records GitHub's action and plan fields rather than inventing commercial entitlement semantics before plans exist.

## Before submission

A real listing needs:

- stable HTTPS service;
- public GitHub App;
- logo, feature card and screenshots;
- privacy policy;
- support contact/path;
- valid listing description;
- pricing plan;
- Marketplace purchase-event handling;
- production monitoring and incident response.

Before any paid plan, transfer/own the app through the intended organization and complete GitHub publisher/financial requirements.

## Draft listing copy

### Name

MergeRadar

### Short description

Know what a pull request can affect before you merge it.

### Full description

MergeRadar maps every pull request to an explainable change-impact surface. See when a PR touches authentication, CI/CD authority, database migrations, infrastructure, dependencies, public APIs, security policy, ownership rules or coding-agent instructions.

MergeRadar is deterministic by design. It does not send source code to an LLM and it does not claim to prove a change safe. Every impact label is traceable to visible repository paths and rules.

Use it to route review attention, spot unowned sensitive changes and make hidden repository authority visible before merge.
