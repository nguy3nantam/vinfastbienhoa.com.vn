#!/bin/sh
# Runs the news sync immediately, then repeats every SYNC_INTERVAL_SECONDS.
INTERVAL="${SYNC_INTERVAL_SECONDS:-21600}"

while true; do
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) starting news sync..."
    if python3 -u sync.py; then
        touch /tmp/last-sync
        rm -f /tmp/sync-failed
        sleep "$INTERVAL"
    else
        touch /tmp/sync-failed
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) sync failed, retrying in 5 minutes"
        sleep 300
    fi
done
