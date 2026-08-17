function escapeRegex(value) {
  return value.replace(/[.+^${}()|[\]\\]/gu, '\\$&');
}

function globBody(pattern) {
  let out = '';
  for (let i = 0; i < pattern.length; i += 1) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        while (pattern[i + 1] === '*') i += 1;
        if (pattern[i + 1] === '/') {
          i += 1;
          out += '(?:.*/)?';
        } else {
          out += '.*';
        }
      } else {
        out += '[^/]*';
      }
      continue;
    }
    if (c === '?') {
      out += '[^/]';
      continue;
    }
    out += escapeRegex(c);
  }
  return out;
}

export function compileCodeownersPattern(rawPattern) {
  let pattern = rawPattern.trim();
  const anchored = pattern.startsWith('/');
  if (anchored) pattern = pattern.slice(1);

  const directoryOnly = pattern.endsWith('/');
  if (directoryOnly) pattern = pattern.slice(0, -1);

  const containsSlash = pattern.includes('/');
  const body = globBody(pattern);

  if (anchored || containsSlash) {
    return new RegExp(`^${body}${directoryOnly ? '(?:/.*)?' : ''}$`, 'u');
  }

  return new RegExp(`(?:^|/)${body}${directoryOnly ? '(?:/.*)?' : '$'}`, 'u');
}

export function parseCodeowners(content) {
  const entries = [];
  const diagnostics = [];

  for (const [index, rawLine] of content.split(/\r?\n/u).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/u);
    const pattern = parts.shift();
    const owners = parts.filter((part) => part.startsWith('@'));

    if (!pattern || owners.length === 0) {
      diagnostics.push({
        line: index + 1,
        code: 'unsupported-line',
        message: 'Ignored CODEOWNERS line without a pattern and at least one @owner.'
      });
      continue;
    }

    if (pattern.startsWith('!') || pattern.includes('[') || pattern.includes(']')) {
      diagnostics.push({
        line: index + 1,
        code: 'unsupported-pattern',
        message: `Pattern uses syntax outside MergeRadar's bounded parser: ${pattern}`
      });
      continue;
    }

    entries.push({
      line: index + 1,
      pattern,
      owners,
      regex: compileCodeownersPattern(pattern)
    });
  }

  return { entries, diagnostics };
}

export function ownersForPath(filename, entries) {
  let owners = [];
  let matchedPattern = null;

  for (const entry of entries) {
    if (entry.regex.test(filename)) {
      owners = entry.owners;
      matchedPattern = entry.pattern;
    }
  }

  return { owners, matchedPattern };
}

export function evaluateCodeowners(files, content) {
  if (!content) {
    return {
      present: false,
      parser: 'bounded-common-subset',
      covered: [],
      unowned: files.map((file) => file.filename),
      diagnostics: []
    };
  }

  const parsed = parseCodeowners(content);
  const covered = [];
  const unowned = [];

  for (const file of files) {
    const match = ownersForPath(file.filename, parsed.entries);
    if (match.owners.length) {
      covered.push({
        path: file.filename,
        owners: match.owners,
        pattern: match.matchedPattern
      });
    } else {
      unowned.push(file.filename);
    }
  }

  return {
    present: true,
    parser: 'bounded-common-subset',
    covered,
    unowned,
    diagnostics: parsed.diagnostics
  };
}
