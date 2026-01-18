#!/bin/bash
# Check status of running/completed agents
# Usage: ./agent-status.sh [agent-id]

TASK_DIR="/tmp/claude/-Users-abhiramaiyer-PlatformFirst-solo/tasks"

if [ -n "$1" ]; then
  # Check specific agent
  OUTPUT_FILE="$TASK_DIR/$1.output"
  if [ ! -f "$OUTPUT_FILE" ]; then
    echo "Agent $1 not found"
    exit 1
  fi

  # Resolve symlink to get actual file
  REAL_FILE=$(readlink -f "$OUTPUT_FILE" 2>/dev/null || echo "$OUTPUT_FILE")

  # Try to extract structured summary
  SUMMARY=$(sed -n '/AGENT_SUMMARY_START/,/AGENT_SUMMARY_END/p' "$REAL_FILE" 2>/dev/null | grep -v "<!--")

  if [ -n "$SUMMARY" ]; then
    echo "=== Agent $1 Summary ==="
    echo "$SUMMARY" | jq '.' 2>/dev/null || echo "$SUMMARY"
  else
    # Fallback: show recent activity
    echo "=== Agent $1 (no structured summary yet) ==="
    echo "Recent tools:"
    grep -o '"name":"[^"]*"' "$REAL_FILE" 2>/dev/null | tail -5 | sed 's/"name":"//g' | sed 's/"//g'
    echo ""
    SIZE=$(du -h "$REAL_FILE" 2>/dev/null | cut -f1)
    echo "File size: $SIZE"
  fi
else
  # List all agents (only non-empty ones)
  echo "=== Active/Recent Agents ==="
  echo ""

  for f in "$TASK_DIR"/*.output; do
    [ -f "$f" ] || continue

    # Resolve symlink
    REAL_FILE=$(readlink -f "$f" 2>/dev/null || echo "$f")

    # Skip empty files
    [ -s "$REAL_FILE" ] || continue

    AGENT_ID=$(basename "$f" .output)
    SIZE=$(du -h "$REAL_FILE" 2>/dev/null | cut -f1)

    # Check for completion summary
    if grep -q "AGENT_SUMMARY_START" "$REAL_FILE" 2>/dev/null; then
      STATUS=$(sed -n '/AGENT_SUMMARY_START/,/AGENT_SUMMARY_END/p' "$REAL_FILE" | grep -v "<!--" | jq -r '.status' 2>/dev/null)
      TASK=$(sed -n '/AGENT_SUMMARY_START/,/AGENT_SUMMARY_END/p' "$REAL_FILE" | grep -v "<!--" | jq -r '.taskId' 2>/dev/null)
      echo "[$AGENT_ID] $TASK - $STATUS ($SIZE)"
    else
      LAST_TOOL=$(grep -o '"name":"[^"]*"' "$REAL_FILE" 2>/dev/null | tail -1 | sed 's/"name":"//g' | sed 's/"//g')
      echo "[$AGENT_ID] Running... (last: $LAST_TOOL, $SIZE)"
    fi
  done
fi
