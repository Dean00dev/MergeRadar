function escapeCell(value) {
  return String(value).replaceAll('|', '\\|');
}

export function formatCheckOutput(report) {
  const impact = report.impact.toUpperCase();
  const lines = [
    '### Change impact map',
    '',
    '| Surface | Tier | Changed paths | Suggested lane |',
    '| --- | ---: | ---: | --- |'
  ];

  if (report.findings.length === 0) {
    lines.push('| No configured sensitive surface matched | 0 | 0 | — |');
  } else {
    for (const finding of report.findings) {
      lines.push(
        `| ${escapeCell(finding.label)} | ${finding.tier} | ${finding.files.length} | ${escapeCell(finding.lane)} |`
      );
    }
  }

  lines.push(
    '',
    `**Changed files:** ${report.changedFiles}`,
    `**Review lanes:** ${report.reviewLanes.join(', ') || 'none suggested'}`,
    `**CODEOWNERS:** ${report.codeowners.present ? `${report.codeowners.covered.length}/${report.changedFiles} changed paths matched by the bounded parser` : 'not found in standard locations'}`,
    `**Unowned sensitive paths:** ${report.unownedSensitiveFiles.length}`,
    '',
    report.complete
      ? '> MergeRadar reports deterministic change impact. A successful check means the analysis completed; it does not certify that a change is safe.'
      : '> MergeRadar could not enumerate the complete pull request because GitHub caps the Pull Files response at 3,000 files. Treat this result as incomplete.'
  );

  const details = report.reasons.length
    ? report.reasons.map((reason) => `- ${reason}`).join('\n')
    : '- No configured impact rule matched.';

  return {
    name: 'MergeRadar / Change Impact',
    status: 'completed',
    conclusion: report.complete ? 'success' : 'neutral',
    output: {
      title: `Impact: ${impact} • ${report.findings.length} ${report.findings.length === 1 ? 'surface' : 'surfaces'}`,
      summary: lines.join('\n'),
      text: `### Why\n\n${details}\n\n### Boundary\n\n${report.boundary}`
    }
  };
}
