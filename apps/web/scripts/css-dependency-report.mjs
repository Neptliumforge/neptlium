#!/usr/bin/env node
/**
 * Read-only CSS dependency inventory. Run from any working directory:
 * node apps/web/scripts/css-dependency-report.mjs
 * Optional: --json (machine-readable stdout).
 * Conservative by design: a missing static import is NOT proof a stylesheet is unused.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(web, '../..');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (['node_modules', '.next', '.git', 'dist', 'coverage', 'playwright-report', 'test-results'].includes(entry.name)) return [];
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const files = [...walk(web), ...walk(resolve(root, 'packages/ui/src'))]
  .filter((path) => /\.(css|tsx?|mjs|jsx?)$/.test(path));
const cssFiles = files.filter((path) => path.endsWith('.css'));
const sources = new Map(files.map((path) => [path, readFileSync(path, 'utf8')]));
const name = (path) => relative(root, path).split(sep).join('/');
const imports = [];
for (const [source, content] of sources) {
  // Test files may contain import-shaped strings used as assertions or fixtures.
  // They are not runtime stylesheet consumers; keep them out of the import graph.
  if (source.includes('/test/') || source.includes('/tests/')) continue;
  const patterns = [
    /\bimport\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+\.css)['"]/gs,
    /\bimport\s*\(\s*['"]([^'"]+\.css)['"]\s*\)/g,
    /@import\s+(?:url\()?\s*['"]([^'"]+\.css)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+\.css)['"]\s*\)/g,
  ];
  for (const pattern of patterns) for (const match of content.matchAll(pattern)) {
    const specifier = match[1];
    const target = specifier.startsWith('.') ? resolve(dirname(source), specifier) : null;
    imports.push({ source: name(source), specifier, target: target && sources.has(target) ? name(target) : null,
      kind: pattern.source.startsWith('@import') ? 'css-import' : 'code-import',
      unresolved: specifier.startsWith('.') && !sources.has(target) });
  }
}
const report = cssFiles.map((path) => {
  const content = sources.get(path);
  const direct = imports.filter((edge) => edge.target === name(path));
  const tokensDefined = [...new Set([...content.matchAll(/(--[a-z][\w-]+)\s*:/gi)].map((m) => m[1]))];
  const tokensUsed = [...new Set([...content.matchAll(/var\(\s*(--[a-z][\w-]+)/gi)].map((m) => m[1]))];
  const classes = [...new Set([...content.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]))];
  const codeConsumers = files.filter((file) => !file.endsWith('.css') && !file.includes('/test/') && !file.includes('/scripts/'))
    .filter((file) => {
      const source = sources.get(file);
      return classes.some((klass) => new RegExp('(?:className|class|styles)[^\\n]{0,160}\\b' + klass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(source));
    }).map(name);
  const tokenConsumers = files.filter((file) => file !== path && file.endsWith('.css'))
    .filter((file) => tokensDefined.some((token) => sources.get(file).includes('var(' + token))).map(name);
  return {
    file: name(path), module: path.endsWith('.module.css'),
    lines: content.split('\n').length, importedBy: direct.map((edge) => edge.source),
    classCount: classes.length, candidateClassConsumers: codeConsumers,
    definedTokens: tokensDefined, usedTokens: tokensUsed, candidateTokenConsumers: tokenConsumers,
    globalEscapes: (content.match(/:global\s*\(/g) || []).length,
    rootRules: (content.match(/:root\s*\{/g) || []).length,
    mediaQueries: (content.match(/@media\b/g) || []).length,
    candidateOnly: direct.length === 0,
  };
});
const result = { generatedFrom: name(web), filesScanned: files.length, cssCount: cssFiles.length,
  imports, stylesheets: report,
  limitations: ['Static lexical scan, not compiled CSS or rendered DOM.',
    'Class and token consumers are candidates, not verified runtime matches.',
    'Dynamic computed class names, CSS composition, framework and external package styles may escape detection.',
    'No zero-import stylesheet is certified safe to delete without build, tests and visual baseline.'] };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log('Web CSS inventory: ' + result.cssCount + ' files; ' + imports.length + ' import edges');
  for (const item of report) console.log([item.file, 'imports=' + item.importedBy.length,
    'candidate JSX consumers=' + item.candidateClassConsumers.length,
    'defined tokens=' + item.definedTokens.length, 'global escapes=' + item.globalEscapes].join(' | '));
  console.log('Unresolved relative CSS imports: ' + imports.filter((edge) => edge.unresolved).length);
  console.log(result.limitations.join('\n'));
}
