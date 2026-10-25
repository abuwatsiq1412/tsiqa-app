#!/usr/bin/env bash
# Menjalankan uji skema pada Postgres lokal sementara. Butuh binary Postgres 15+.
# 1) Inti berdiri sendiri (hanya 0001)  2) Seluruh migrasi + uji perilaku lengkap.
set -euo pipefail
PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}; PORT=${PORT:-5544}
HERE=$(cd "$(dirname "$0")" && pwd); MIG="$HERE/../migrations"
D=$(mktemp -d); chmod 755 "$D"
if [ "$(id -u)" = 0 ]; then RUN() { su postgres -c "$*"; }; chown postgres "$D"; PGU=postgres; chmod -R a+rX "$HERE/.."; else RUN() { bash -c "$*"; }; PGU=$(whoami); fi
cleanup(){ RUN "$PGBIN/pg_ctl -D $D/data stop -m immediate" >/dev/null 2>&1 || true; }; trap cleanup EXIT
RUN "$PGBIN/initdb -D $D/data -A trust" >/dev/null
RUN "$PGBIN/pg_ctl -D $D/data -o '-p $PORT -k $D' -l $D/log -w start" >/dev/null
export PGHOST=$D PGPORT=$PORT PGUSER=$PGU

echo "### A. Inti berdiri sendiri (tanpa modul)"
createdb tsiqa_inti
psql -q -d tsiqa_inti -v ON_ERROR_STOP=1 -f "$HERE/stub_supabase.sql" -f "$MIG/0001_inti.sql"
psql -q -d tsiqa_inti -v ON_ERROR_STOP=1 -f "$HERE/uji_inti.sql"

echo "### B. Seluruh migrasi + uji perilaku"
createdb tsiqa_test
psql -q -d tsiqa_test -v ON_ERROR_STOP=1 -f "$HERE/stub_supabase.sql"
for f in $(ls "$MIG"/*.sql | sort); do psql -q -d tsiqa_test -v ON_ERROR_STOP=1 -f "$f"; done
psql -q -d tsiqa_test -f "$HERE/uji.sql"
echo "### C. Portal Wali"
psql -q -d tsiqa_test -f "$HERE/uji_wali.sql"
psql -q -d tsiqa_test -f "$HERE/uji_akademik.sql"
