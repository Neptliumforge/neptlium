import { readFileSync } from 'node:fs';

function objectBlocks(path) {
  return readFileSync(path, 'utf8')
    .replace(/\n--\n-- PostgreSQL database dump complete\n--\n\s*$/, '\n')
    .split(/\n--\n(?=-- Name: )/)
    .map(block => {
      const trimmed = block.trim();
      if (!/^-- Name: .*; Type: (?:ACL|DEFAULT ACL);/m.test(trimmed)) return trimmed;
      return trimmed.split('\n').filter(Boolean).sort().join('\n');
    });
}

const expected = objectBlocks(process.argv[2]);
const restored = objectBlocks(process.argv[3]);
const counts = new Map();
for (const block of expected) counts.set(block, (counts.get(block) ?? 0) + 1);
for (const block of restored) counts.set(block, (counts.get(block) ?? 0) - 1);
const differences = [...counts].filter(([, count]) => count !== 0);
for (const [block, count] of differences) {
  // Report object headers only; definitions and row contents stay local.
  const header = block.split('\n').find(line => line.startsWith('-- Name: ')) ?? 'dump preamble';
  console.error(`${count > 0 ? 'missing or changed' : 'extra or changed'}: ${header}`);
}
if (differences.length) process.exitCode = 1;
else console.log(`Verified ${expected.length} schema dump blocks and exact ACL statements`);
