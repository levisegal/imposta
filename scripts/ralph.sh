#!/usr/bin/env bash
# ralph.sh — Ralph Wiggum iterative Claude loop
set -euo pipefail

PROMPT_FILE="${1:-PROMPT.md}"
MAX_ITERATIONS="${2:-50}"
COMPLETION_MARKER="${3:-RALPH_DONE}"

if [[ ! -f "$PROMPT_FILE" ]]; then
    echo "Error: $PROMPT_FILE not found" >&2
    echo "Usage: $0 [PROMPT_FILE] [MAX_ITERATIONS] [COMPLETION_MARKER]" >&2
    exit 1
fi

echo "🧒 Ralph starting: $PROMPT_FILE (max $MAX_ITERATIONS iterations)"
echo "   Completion marker: $COMPLETION_MARKER"
echo ""

iteration=0
while [[ $iteration -lt $MAX_ITERATIONS ]]; do
    ((iteration++))
    echo "━━━ Iteration $iteration/$MAX_ITERATIONS ━━━"
    
    if claude --print < "$PROMPT_FILE" | tee /tmp/ralph-output.txt | grep -q "$COMPLETION_MARKER"; then
        echo ""
        echo "✅ Ralph completed after $iteration iteration(s)"
        exit 0
    fi
    
    echo ""
done

echo "⚠️  Ralph hit max iterations ($MAX_ITERATIONS) without completion"
exit 1

