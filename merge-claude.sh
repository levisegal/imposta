#!/usr/bin/env bash
# merge-claude.sh — Merge top-level CLAUDE.md into project CLAUDE.local.md
set -euo pipefail

TOP_LEVEL="${HOME}/CLAUDE.md"
LOCAL_FILE="CLAUDE.local.md"

if [[ ! -f "$TOP_LEVEL" ]]; then
    echo "Error: $TOP_LEVEL not found" >&2
    exit 1
fi

# Check if merge needed: local missing or top-level is newer
needs_merge=false
if [[ ! -f "$LOCAL_FILE" ]]; then
    needs_merge=true
elif [[ "$TOP_LEVEL" -nt "$LOCAL_FILE" ]]; then
    needs_merge=true
fi

if [[ "$needs_merge" == "true" ]]; then
    {
        echo "<!-- AUTO-GENERATED: sourced from ~/CLAUDE.md -->"
        echo "<!-- Last merged: $(date -Iseconds) -->"
        echo ""
        cat "$TOP_LEVEL"
    } > "$LOCAL_FILE"
    echo "Merged $TOP_LEVEL → $LOCAL_FILE"
else
    echo "$LOCAL_FILE is up to date"
fi

