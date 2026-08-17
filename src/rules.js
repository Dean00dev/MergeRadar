const rx = (pattern) => new RegExp(pattern, 'iu');

export const SURFACES = Object.freeze([
  {
    id: 'auth',
    label: 'Authentication / authorization',
    tier: 3,
    lane: 'security',
    matchers: [
      rx('(^|/)(auth|authentication|authorization|permissions?|rbac|acl)(/|\\.|$)'),
      rx('(^|/)(login|logout|session|sessions|oauth|oidc|sso|jwt|tokens?)(/|\\.|$)')
    ]
  },
  {
    id: 'cicd',
    label: 'CI/CD authority',
    tier: 3,
    lane: 'platform',
    matchers: [
      rx('^\\.github/workflows/'),
      rx('(^|/)(Jenkinsfile|\\.gitlab-ci\\.ya?ml|azure-pipelines\\.ya?ml)$'),
      rx('(^|/)(deploy|deployment|release)(/|\\.|$)')
    ]
  },
  {
    id: 'database',
    label: 'Database schema / migration',
    tier: 3,
    lane: 'database',
    matchers: [
      rx('(^|/)(migrations?|db/migrate)(/|$)'),
      rx('(^|/)(schema\\.sql|schema\\.prisma)$'),
      rx('(^|/)database(/|$)')
    ]
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure / runtime',
    tier: 3,
    lane: 'platform',
    matchers: [
      rx('(^|/).*\\.tf$'),
      rx('(^|/)(terraform|infra|infrastructure|k8s|kubernetes|helm)(/|$)'),
      rx('(^|/)(Dockerfile|docker-compose\\.ya?ml|compose\\.ya?ml)$')
    ]
  },
  {
    id: 'dependencies',
    label: 'Dependency graph',
    tier: 2,
    lane: 'maintainers',
    matchers: [
      rx('(^|/)(package(-lock)?\\.json|pnpm-lock\\.yaml|yarn\\.lock)$'),
      rx('(^|/)(requirements.*\\.txt|poetry\\.lock|pyproject\\.toml)$'),
      rx('(^|/)(Cargo\\.(toml|lock)|go\\.(mod|sum)|Gemfile(\\.lock)?|pom\\.xml)$'),
      rx('(^|/)(build\\.gradle(\\.kts)?|gradle\\.properties)$')
    ]
  },
  {
    id: 'public-api',
    label: 'Public API contract',
    tier: 2,
    lane: 'api',
    matchers: [
      rx('(^|/)(openapi|swagger)(\\.|/|$)'),
      rx('(^|/)(api|routes?|controllers?)(/|$)'),
      rx('(^|/)(schema\\.graphql|.*\\.graphqls)$')
    ]
  },
  {
    id: 'security-config',
    label: 'Security / ownership policy',
    tier: 2,
    lane: 'security',
    matchers: [
      rx('(^|/)CODEOWNERS$'),
      rx('(^|/)SECURITY\\.md$'),
      rx('^\\.github/(dependabot\\.ya?ml|codeql/|ISSUE_TEMPLATE/config\\.ya?ml)')
    ]
  },
  {
    id: 'agent-instructions',
    label: 'Coding-agent instructions',
    tier: 2,
    lane: 'maintainers',
    matchers: [
      rx('(^|/)(AGENTS(\\.override)?\\.md|CLAUDE\\.md|GEMINI\\.md)$'),
      rx('^\\.github/copilot-instructions\\.md$'),
      rx('^\\.github/instructions/.*\\.instructions\\.md$'),
      rx('(^|/)\\.cursor/rules/.*\\.mdc$'),
      rx('(^|/)\\.cursorrules$')
    ]
  },
  {
    id: 'build-system',
    label: 'Build / packaging',
    tier: 2,
    lane: 'maintainers',
    matchers: [
      rx('(^|/)(Makefile|CMakeLists\\.txt|meson\\.build|BUILD|WORKSPACE)$'),
      rx('(^|/)(tsconfig.*\\.json|vite\\.config\\..*|webpack\\.config\\..*)$')
    ]
  }
]);

export function classifyPath(filename) {
  const normalized = filename.replaceAll('\\', '/').replace(/^\.\/+/u, '');
  return SURFACES.filter((surface) =>
    surface.matchers.some((matcher) => matcher.test(normalized))
  ).map((surface) => ({
    id: surface.id,
    label: surface.label,
    tier: surface.tier,
    lane: surface.lane
  }));
}
