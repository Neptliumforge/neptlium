#!/usr/bin/env bash
set -euo pipefail
umask 077

mode=${1:?backup mode required}
out=${2:?encrypted output directory required}
scratch=$(mktemp -d)
restore=gate02j-restore
fixture=gate02j-source
cleanup() {
  docker rm -f "$restore" "$fixture" >/dev/null 2>&1 || true
  rm -rf -- "$scratch"
}
trap cleanup EXIT

image=postgres:17
dev_ref=ntbaoylcrwkowqqvzkno
wait_db() {
  for attempt in {1..40}; do
    if docker exec "$1" pg_isready -q -h 127.0.0.1 -U "$2" -d postgres; then return; fi
    sleep 1
  done
  return 1
}
private() {
  if ! "$@" 2>>"$scratch/private.log"; then
    printf 'Backup verification failed at stage: %s\n' "$stage" >&2
    exit 1
  fi
}

stage=source-setup
case "$mode" in
  dev)
    # Never accept a caller-provided URL or project ref.
    export PGHOST="db.$dev_ref.supabase.co" PGPORT=5432 PGDATABASE=postgres PGUSER=postgres
    if [[ -n ${NEPTLIUM_DEV_SESSION_POOLER_HOST:-} ]]; then
      [[ "$NEPTLIUM_DEV_SESSION_POOLER_HOST" =~ ^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$ ]]
      export PGHOST=$NEPTLIUM_DEV_SESSION_POOLER_HOST PGUSER="postgres.$dev_ref"
    fi
    : "${NEPTLIUM_DEV_DB_PASSWORD:?Dev database password secret is required}"
    : "${NEPTLIUM_DEV_DB_CA_PEM:?Dev CA certificate secret is required}"
    : "${NEPTLIUM_DEV_BACKUP_AGE_RECIPIENT:?Backup encryption recipient is required}"
    printf '%s\n' "$NEPTLIUM_DEV_DB_CA_PEM" > "$scratch/dev-ca.pem"
    export PGPASSWORD=$NEPTLIUM_DEV_DB_PASSWORD PGSSLMODE=verify-full PGSSLROOTCERT=/gate02j/dev-ca.pem
    ;;
  fixture)
    private docker run -d --name "$fixture" -e POSTGRES_HOST_AUTH_METHOD=trust \
      -p 127.0.0.1::5432 "$image" >/dev/null
    private wait_db "$fixture" postgres
    private docker exec "$fixture" psql -Xq -v ON_ERROR_STOP=1 -U postgres -d postgres -c "
      create role fixture_reader;
      create role fixture_member;
      grant fixture_reader to fixture_member;
      create schema application_fixture;
      create schema supabase_migrations;
      create table application_fixture.records (id integer primary key, label text);
      create table supabase_migrations.schema_migrations (version text primary key);
      insert into application_fixture.records values (1, 'synthetic preview record');
      insert into supabase_migrations.schema_migrations values ('20260710104755');
      alter table application_fixture.records enable row level security;
      create policy read_fixture on application_fixture.records for select to fixture_reader using (true);
      grant usage on schema application_fixture to fixture_reader;
      grant select on application_fixture.records to fixture_reader" >/dev/null
    export PGHOST=127.0.0.1 PGPORT
    PGPORT=$(docker port "$fixture" 5432/tcp | sed 's/.*://')
    export PGDATABASE=postgres PGUSER=postgres PGSSLMODE=disable
    age-keygen -o "$scratch/fixture-age.key" 2>"$scratch/private.log"
    NEPTLIUM_DEV_BACKUP_AGE_RECIPIENT=$(age-keygen -y "$scratch/fixture-age.key")
    ;;
  *) exit 2 ;;
esac
export PGOPTIONS='-c default_transaction_read_only=on' PGCONNECT_TIMEOUT=15

source_pg() {
  docker run --rm -i --network host --user "$(id -u):$(id -g)" \
    --mount "type=bind,src=$scratch,dst=/gate02j,readonly" \
    -e PGHOST -e PGPORT -e PGDATABASE -e PGUSER -e PGPASSWORD -e PGSSLMODE \
    -e PGSSLROOTCERT -e PGOPTIONS -e PGCONNECT_TIMEOUT "$image" "$@"
}

stage=inventory
mkdir "$scratch/bundle"
private source_pg psql -XAt -v ON_ERROR_STOP=1 -c "
  select quote_ident(nspname) from pg_namespace
  where nspname not like 'pg\\_%' and nspname not in
    ('information_schema','auth','storage','extensions','graphql','graphql_public','realtime','vault',
     'net','cron','supabase_functions','pgsodium','pgsodium_masks','_realtime','_analytics','supabase_internal',
     'pgmq','pgbouncer')
  order by nspname" > "$scratch/bundle/schemas.txt"
mapfile -t schemas < "$scratch/bundle/schemas.txt"
(( ${#schemas[@]} > 0 ))
scope=()
for schema in "${schemas[@]}"; do scope+=("--schema=$schema"); done
private source_pg psql -XAt -v ON_ERROR_STOP=1 -c "
  select json_build_object('auth_schema',to_regnamespace('auth') is not null,
    'storage_schema',to_regnamespace('storage') is not null,
    'extensions',(select json_agg(extname order by extname) from pg_extension))" > "$scratch/bundle/managed-inventory.json"

stage=backup
private source_pg pg_dump --format=custom "${scope[@]}" > "$scratch/bundle/application.dump"
private source_pg pg_dumpall --roles-only --no-role-passwords > "$scratch/bundle/roles.sql"
private source_pg pg_dump --schema-only "${scope[@]}" > "$scratch/source-schema.sql"
private source_pg pg_dump --data-only "${scope[@]}" > "$scratch/source-data.sql"
(
  cd "$scratch/bundle"
  sha256sum application.dump roles.sql schemas.txt managed-inventory.json > SHA256SUMS
  sha256sum --check --status SHA256SUMS
)

stage=isolated-restore
private docker run -d --name "$restore" --network none -e POSTGRES_USER=gate02j_restore \
  -e POSTGRES_HOST_AUTH_METHOD=trust "$image" >/dev/null
private wait_db "$restore" gate02j_restore
private docker exec -i "$restore" psql -Xq -v ON_ERROR_STOP=1 -U gate02j_restore -d postgres \
  < "$scratch/bundle/roles.sql" >/dev/null
private docker cp "$scratch/bundle/application.dump" "$restore:/tmp/application.dump"
private docker exec "$restore" pg_restore --list /tmp/application.dump > "$scratch/archive.list"
# PostgreSQL initializes public on the isolated target.
sed -E '/^[0-9]+; [0-9]+ [0-9]+ SCHEMA - public /d' "$scratch/archive.list" > "$scratch/restore.list"
private docker exec -i "$restore" pg_restore -U gate02j_restore -d postgres --exit-on-error \
  --use-list=/dev/stdin /tmp/application.dump < "$scratch/restore.list" >/dev/null
private docker exec "$restore" pg_dump -U gate02j_restore -d postgres --schema-only "${scope[@]}" > "$scratch/restored-schema.sql"
private docker exec "$restore" pg_dump -U gate02j_restore -d postgres --data-only "${scope[@]}" > "$scratch/restored-data.sql"
private docker exec "$restore" pg_dumpall -U gate02j_restore --roles-only --no-role-passwords > "$scratch/restored-roles.sql"

stage=compare
normalize() {
  sed -E '/^\\(un)?restrict /d; /^-- Dumped (from database|by pg_dump) version /d' "$1"
}
normalize "$scratch/source-schema.sql" > "$scratch/source-schema.normalized"
normalize "$scratch/restored-schema.sql" > "$scratch/restored-schema.normalized"
private node "$(dirname "$0")/check-restored-schema.mjs" "$scratch/source-schema.normalized" \
  "$scratch/restored-schema.normalized" >/dev/null
private cmp -s <(normalize "$scratch/source-data.sql") <(normalize "$scratch/restored-data.sql")
roles() {
  normalize "$1" | grep -E '^(CREATE ROLE |ALTER ROLE |GRANT |COMMENT ON ROLE |SECURITY LABEL)' \
    | grep -vE '^(CREATE|ALTER) ROLE gate02j_restore([ ;]|$)' | LC_ALL=C sort
}
private cmp -s <(roles "$scratch/bundle/roles.sql") <(roles "$scratch/restored-roles.sql")

stage=encryption
mkdir -p "$out"
if ! tar -C "$scratch/bundle" -cf - . | age -r "$NEPTLIUM_DEV_BACKUP_AGE_RECIPIENT" \
    -o "$out/neptlium-dev-backup.tar.age" 2>>"$scratch/private.log"; then
  printf 'Backup encryption failed.\n' >&2
  exit 1
fi
(
  cd "$out"
  sha256sum neptlium-dev-backup.tar.age > neptlium-dev-backup.tar.age.sha256
  sha256sum --check --status neptlium-dev-backup.tar.age.sha256
)
if [[ "$mode" = fixture ]]; then
  mkdir "$scratch/decrypted"
  age -d -i "$scratch/fixture-age.key" "$out/neptlium-dev-backup.tar.age" | tar -xf - -C "$scratch/decrypted"
  (cd "$scratch/decrypted" && sha256sum --check --status SHA256SUMS)
fi
printf 'Backup checksums, isolated schema, records, roles, grants and encryption verified (%s).\n' "$mode"
