import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const manifestUrl = new URL('../schema-install-manifest.json', import.meta.url);
const migrationsUrl = new URL('../migrations/', import.meta.url);

function gitBlob(contents) {
  return createHash('sha1').update(`blob ${contents.length}\0`).update(contents).digest('hex');
}

export function schemaInstallPlan(applied, manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'))) {
  if (!Array.isArray(applied)) throw new Error('Applied migration history must be a JSON array');
  const files = readdirSync(migrationsUrl).filter(file => file.endsWith('.sql')).sort();
  const planned = manifest.migrations.map(entry => entry.file);
  if (files.length !== planned.length || files.some((file, index) => file !== planned[index])) {
    throw new Error('Migration inventory differs from the reviewed installation manifest');
  }

  const versions = manifest.migrations.map(({ file, blob }) => {
    if (!/^\d{14}_[a-z0-9_]+\.sql$/.test(file) || gitBlob(readFileSync(new URL(file, migrationsUrl))) !== blob) {
      throw new Error(`Migration differs from the reviewed manifest: ${file}`);
    }
    return file.slice(0, 14);
  });
  if (new Set(versions).size !== versions.length) throw new Error('Duplicate migration version');
  if (applied.length > versions.length ||
      applied.some((version, index) => typeof version !== 'string' || version !== versions[index])) {
    throw new Error('Applied migration history is not an exact prefix of the reviewed sequence');
  }

  return { source: manifest.source, appliedCount: applied.length, pending: planned.slice(applied.length) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node supabase/scripts/schema-install-plan.mjs <migration-history.json>');
    const applied = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    process.stdout.write(JSON.stringify(schemaInstallPlan(applied), null, 2) + '\n');
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : 'Installation plan failed') + '\n');
    process.exitCode = 1;
  }
}
