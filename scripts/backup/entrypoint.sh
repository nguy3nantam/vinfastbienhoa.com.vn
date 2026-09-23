#!/bin/sh
set -eu
umask 077

INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

backup_once() {
    timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
    stage="$(mktemp -d /tmp/pocketbase-backup.XXXXXX)"
    archive="/backups/pocketbase-$timestamp.tar.gz"
    trap 'rm -rf "$stage"' EXIT

    mkdir -p "$stage" /backups
    test -s /data/data.db
    sqlite3 -readonly /data/data.db ".timeout 10000" ".backup '$stage/data.db'"
    test -s "$stage/data.db"
    test "$(sqlite3 "$stage/data.db" 'pragma integrity_check;')" = "ok"
    test "$(sqlite3 "$stage/data.db" 'select count(*) from sqlite_master;')" -gt 0

    if [ -f /data/auxiliary.db ]; then
        test -s /data/auxiliary.db
        sqlite3 -readonly /data/auxiliary.db ".timeout 10000" ".backup '$stage/auxiliary.db'"
        test -s "$stage/auxiliary.db"
        test "$(sqlite3 "$stage/auxiliary.db" 'pragma integrity_check;')" = "ok"
    fi
    if [ -d /data/storage ]; then
        cp -R /data/storage "$stage/storage"
    fi
    if [ -d /data/.notify ]; then
        cp -R /data/.notify "$stage/.notify"
    fi

    tar -czf "$archive.partial" -C "$stage" .
    tar -tzf "$archive.partial" >/dev/null
    mv "$archive.partial" "$archive"
    find /backups -type f -name 'pocketbase-*.tar.gz' -mtime "+$RETENTION_DAYS" -delete
    touch /tmp/last-backup
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) backup created: $archive"
}

# Execute in a separate shell: calling a function inside `if` disables errexit
# throughout that function, which previously published empty databases.
if [ "${1:-}" = "--once" ]; then
    backup_once
    exit 0
fi

while true; do
    if sh "$0" --once; then
        rm -f /tmp/backup-failed
        sleep "$INTERVAL"
    else
        touch /tmp/backup-failed
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) backup failed; retrying in 5 minutes" >&2
        sleep 300
    fi
done
