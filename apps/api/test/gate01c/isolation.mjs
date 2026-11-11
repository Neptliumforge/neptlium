import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile, appendFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

const host = 'unix:///var/run/docker.sock';
const container = process.env.NEPTLIUM_GATE01C_CONTAINER_ID;
const root = '/tmp/neptlium-gate01c';
let sequence = 0;
const safeEnv = { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', HOME: `${root}/empty-home` };
function command(args, input = '') {
  return new Promise((done, reject) => {
    const child = spawn('docker', ['--host', host, ...args], { env: safeEnv, stdio: ['pipe','pipe','pipe'] });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', data => { stdout += data; }); child.stderr.on('data', data => { stderr += data; });
    child.on('error', reject);
    child.on('close', code => done({ code, stdout, stderr }));
    child.stdin.end(input);
  });
}
export async function verifyIsolation() {
  if (!container || !/^[0-9a-f]{64}$/.test(container)) throw Error('Explicit disposable container ID required');
  const proof = JSON.parse(await readFile(`${root}/isolation.json`, 'utf8'));
  if (proof.container_id !== container) throw Error('Container identity mismatch');
  const result = await command(['inspect',container]);
  if (result.code) throw Error('Cannot prove Docker isolation');
  const value = JSON.parse(result.stdout)[0]; const settings = value.HostConfig;
  const env = Object.fromEntries(value.Config.Env.map(item => item.split(/=(.*)/s).slice(0,2)));
  const allowed = ['PATH','GOSU_VERSION','LANG','PG_MAJOR','PG_VERSION','PGDATA','POSTGRES_DB','POSTGRES_HOST_AUTH_METHOD'];
  if (!value.State.Running || value.Image !== proof.image_id || settings.NetworkMode !== 'none' ||
      settings.Privileged || !settings.ReadonlyRootfs || settings.Binds?.length || Object.keys(settings.PortBindings ?? {}).length ||
      value.Mounts.some(mount => mount.Type !== 'tmpfs') ||
      value.Config.Labels?.['neptlium.audit'] !== 'gate01c' || env.POSTGRES_DB !== 'gate01c_disposable' ||
      env.PG_MAJOR !== '17' || env.POSTGRES_HOST_AUTH_METHOD !== 'trust' || Object.keys(env).some(key => !allowed.includes(key)) ||
      Object.keys(env).some(key => /SECRET|PASSWORD|TOKEN|KEY|DATABASE_URL|SUPABASE_URL|PGSERVICE/.test(key)) ||
      Object.values(value.NetworkSettings.Networks).some(network => network.IPAddress)) throw Error('Disposable isolation proof failed');
  return proof;
}
export async function sql(database, source, label = 'query') {
  await verifyIsolation();
  if (!/^gate01c_[a-z0-9_]+$/.test(database)) throw Error('Non-disposable database name rejected');
  if (/\\(?:connect|c\s|!|copy|include|ir)|copy\s+.*program|dblink|postgres_fdw/i.test(source)) throw Error('Unreviewed SQL transport rejected');
  await mkdir(`${root}/executions`, { recursive: true });
  const id = `${Date.now()}-${process.pid}-${++sequence}-${label.replace(/[^a-z0-9_-]/gi,'_')}`;
  const path = `${root}/executions/${id}.sql`;
  await writeFile(path,source);
  const result = await command(['exec','-i',container,'psql','-X','--host=/var/run/postgresql','--username=postgres',`--dbname=${database}`,'--no-password','--quiet','--tuples-only','--no-align','--set=ON_ERROR_STOP=1'],source);
  await writeFile(`${root}/executions/${id}.log`,result.stdout+result.stderr);
  await appendFile(`${root}/sql-inventory.jsonl`,JSON.stringify({ id,database,label,path,sha256:createHash('sha256').update(source).digest('hex'),exitCode:result.code })+'\n');
  if (result.code) throw Error(result.stderr || 'Isolated SQL failed');
  return result.stdout.trim();
}
export async function newDatabase(label) {
  const database = `gate01c_${label.replace(/[^a-z0-9_]/g,'')}_${randomUUID().replaceAll('-','').slice(0,12)}`;
  await sql('gate01c_disposable',`create database ${database};`,'create_disposable_database');
  return database;
}
function literal(value) {
  if (value === null || value === undefined) return 'NULL';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `'${text.replaceAll("'", "''")}'`;
}
export function handle(database) {
  return {
    exec: source => sql(database,source,'exec'),
    query: async (source, parameters = []) => {
      const bound = source.replace(/\$(\d+)/g, (_match,n) => literal(parameters[Number(n)-1]));
      const trimmed = bound.trim().replace(/;$/,'');
      const returns = /^select\b/i.test(trimmed) || /\breturning\b/i.test(trimmed);
      const query = returns ? `with gate01c_result as (${trimmed}) select coalesce(jsonb_agg(row_to_json(gate01c_result)),'[]'::jsonb) from gate01c_result;` : trimmed;
      const output = await sql(database,query,'query');
      return { rows: returns ? JSON.parse(output) : [] };
    },
    close: async () => {}, // Keep disposable evidence until explicit cleanup; never drops an existing database.
  };
}
export async function loadSql(path) {
  const file = resolve(path); const source = await readFile(file,'utf8');
  if (!file.startsWith(`${root}/dependencies/`) && !file.startsWith('/workspaces/neptlium/')) throw Error('Unapproved SQL path');
  const result = [];
  for (const line of source.split('\n')) {
    const include = /^\\ir\s+(\S+)\s*$/.exec(line);
    if (include) result.push(await loadSql(resolve(file,'..',include[1])));
    else if (/^\\set ON_ERROR_STOP on\s*$/.test(line)) continue;
    else if (/^\\/.test(line)) throw Error('Unreviewed psql metacommand');
    else result.push(line);
  }
  return result.join('\n');
}
