#!/usr/bin/env node
/**
 * DevLib secret scan. Runs from a project's .git/hooks/pre-commit.
 * Blocks the commit when staged changes add likely credentials or stage a real .env file.
 * Scans only ADDED lines of the staged diff, so existing history is not re-flagged.
 *
 * Bypass for a known false positive: put `devlib-allow-secret` on the same line.
 */

import { execSync } from 'child_process';

const PATTERNS = [
  { name: 'AWS access key ID', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----/ },
  { name: 'OpenAI/Anthropic-style secret key', re: /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: 'GitHub token', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b/ },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Stripe live key', re: /\b(?:sk|rk)_live_[0-9A-Za-z]{20,}\b/ },
  { name: 'JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { name: 'Connection string with password', re: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^\s:/@]+:[^\s@/]{3,}@/i },
  {
    name: 'Hardcoded secret assignment',
    re: /\b(?:api[_-]?key|secret|password|passwd|access[_-]?token|auth[_-]?token|client[_-]?secret)\b\s*[:=]\s*["'][^"'\s]{12,}["']/i,
  },
];

const ENV_FILE = /(^|\/)\.env(\.[^/]+)?$/;
const ENV_ALLOWED = /\.(example|sample|template|dist)$/;
// DevLib-managed content (e.g. security-review skill) contains example secrets as teaching material.
const SKIP_PATH = /^\.devlib(\.bak)?\//;

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const findings = [];

// 1. Real .env files must never be committed.
for (const f of sh('git diff --cached --name-only --diff-filter=ACM').split('\n').filter(Boolean)) {
  if (ENV_FILE.test(f) && !ENV_ALLOWED.test(f)) findings.push(`${f}: environment file staged (add it to .gitignore)`);
}

// 2. Scan added lines of the staged diff.
let file = null;
let lineNo = 0;
for (const line of sh('git diff --cached -U0 --no-color --diff-filter=ACM').split('\n')) {
  if (line.startsWith('+++ ')) {
    file = line.slice(4).replace(/^b\//, '');
    continue;
  }
  const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
  if (hunk) {
    lineNo = Number(hunk[1]);
    continue;
  }
  if (line.startsWith('+') && !line.startsWith('+++')) {
    const added = line.slice(1);
    if (!SKIP_PATH.test(file) && !added.includes('devlib-allow-secret')) {
      for (const { name, re } of PATTERNS) {
        if (re.test(added)) findings.push(`${file}:${lineNo}: ${name}`);
      }
    }
    lineNo++;
  }
}

if (findings.length) {
  console.error('DevLib secret scan: commit blocked.');
  for (const f of findings) console.error(`  - ${f}`);
  console.error('Move the value to an environment variable (process.env.NAME).');
  console.error('False positive? Add `devlib-allow-secret` on that line.');
  process.exit(1);
}
process.exit(0);
