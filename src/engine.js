import { classifyPath } from './rules.js';
import { evaluateCodeowners } from './codeowners.js';

function unique(values) {
  return [...new Set(values)];
}

export function analyzeChange({ files, codeownersText = null }) {
  const findingsBySurface = new Map();

  for (const file of files) {
    for (const surface of classifyPath(file.filename)) {
      const finding = findingsBySurface.get(surface.id) ?? {
        ...surface,
        files: []
      };
      finding.files.push(file.filename);
      findingsBySurface.set(surface.id, finding);
    }
  }

  const findings = [...findingsBySurface.values()]
    .map((finding) => ({
      ...finding,
      files: unique(finding.files).sort()
    }))
    .sort((a, b) => b.tier - a.tier || a.label.localeCompare(b.label));

  const codeowners = evaluateCodeowners(files, codeownersText);
  const sensitiveFiles = unique(
    findings
      .filter((finding) => finding.tier >= 2)
      .flatMap((finding) => finding.files)
  );

  const unownedSensitiveFiles = sensitiveFiles.filter((filename) =>
    codeowners.unowned.includes(filename)
  );

  const maxTier = findings.reduce((max, finding) => Math.max(max, finding.tier), 0);
  let impact = 'low';

  if (maxTier >= 3) impact = 'high';
  else if (maxTier >= 2 || findings.length >= 3) impact = 'moderate';

  const reasons = findings.map((finding) =>
    `${finding.label}: ${finding.files.length} changed ${finding.files.length === 1 ? 'path' : 'paths'}`
  );

  if (unownedSensitiveFiles.length) {
    reasons.push(
      `${unownedSensitiveFiles.length} sensitive changed ${unownedSensitiveFiles.length === 1 ? 'path has' : 'paths have'} no owner under MergeRadar's bounded CODEOWNERS parser`
    );
  }

  return {
    schemaVersion: 1,
    impact,
    findings,
    reviewLanes: unique(findings.map((finding) => finding.lane)).sort(),
    changedFiles: files.length,
    stats: {
      additions: files.reduce((sum, file) => sum + Number(file.additions || 0), 0),
      deletions: files.reduce((sum, file) => sum + Number(file.deletions || 0), 0),
      changes: files.reduce((sum, file) => sum + Number(file.changes || 0), 0)
    },
    codeowners,
    unownedSensitiveFiles,
    reasons,
    boundary:
      'Impact is deterministic path-based review routing, not a vulnerability score, exploitability estimate, or merge-safety guarantee.'
  };
}
