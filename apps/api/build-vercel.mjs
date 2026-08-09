import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

rmSync(join(root, 'dist'), {
  recursive: true,
  force: true,
});

rmSync(join(root, 'tsconfig.build.tsbuildinfo'), {
  force: true,
});

execFileSync(
  'pnpm',
  ['exec', 'tsc', '-p', 'tsconfig.build.json'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);

const serverless = join(root, 'dist', 'serverless.js');
const app = join(root, 'dist', 'app.js');

if (!existsSync(serverless) || !existsSync(app)) {
  throw new Error(
    'Neptlium API production build did not emit required runtime modules',
  );
}

console.log('Neptlium API runtime bundle emitted successfully.');
