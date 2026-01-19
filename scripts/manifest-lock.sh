#!/bin/bash
#
# Manifest Lock Utility (Shell version)
# Fast file-based locking for manifest updates
#
# Usage:
#   ./scripts/manifest-lock.sh acquire <agent-id>
#   ./scripts/manifest-lock.sh release <agent-id>
#   ./scripts/manifest-lock.sh status
#   ./scripts/manifest-lock.sh force-release

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCK_FILE="$SCRIPT_DIR/../docs/planning/tasks/manifest.lock"
LOCK_TIMEOUT=60  # seconds

acquire_lock() {
    local agent_id="$1"
    local max_attempts=20
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if [ ! -f "$LOCK_FILE" ]; then
            # No lock, create it
            echo "{\"agentId\": \"$agent_id\", \"acquiredAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"pid\": $$}" > "$LOCK_FILE"
            echo "Lock acquired by $agent_id"
            return 0
        fi
        
        # Check if lock is stale
        if [ -f "$LOCK_FILE" ]; then
            local lock_time=$(stat -f %m "$LOCK_FILE" 2>/dev/null || stat -c %Y "$LOCK_FILE" 2>/dev/null)
            local now=$(date +%s)
            local age=$((now - lock_time))
            
            if [ $age -gt $LOCK_TIMEOUT ]; then
                local old_agent=$(grep -o '"agentId": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
                echo "Stale lock from $old_agent (${age}s old), taking over"
                echo "{\"agentId\": \"$agent_id\", \"acquiredAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"pid\": $$}" > "$LOCK_FILE"
                echo "Lock acquired by $agent_id"
                return 0
            fi
            
            # Check if we already hold it
            local current_agent=$(grep -o '"agentId": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
            if [ "$current_agent" = "$agent_id" ]; then
                echo "Lock already held by $agent_id"
                return 0
            fi
        fi
        
        if [ $attempt -eq 0 ]; then
            local holder=$(grep -o '"agentId": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
            echo "Lock held by $holder, waiting..."
        fi
        
        sleep 0.5
        attempt=$((attempt + 1))
    done
    
    echo "Failed to acquire lock after $max_attempts attempts"
    return 1
}

release_lock() {
    local agent_id="$1"
    
    if [ ! -f "$LOCK_FILE" ]; then
        echo "No lock to release"
        return 0
    fi
    
    local current_agent=$(grep -o '"agentId": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
    if [ "$current_agent" != "$agent_id" ]; then
        echo "Cannot release lock: held by $current_agent, not $agent_id"
        return 1
    fi
    
    rm -f "$LOCK_FILE"
    echo "Lock released by $agent_id"
    return 0
}

show_status() {
    if [ ! -f "$LOCK_FILE" ]; then
        echo "Status: UNLOCKED"
        echo "Manifest is available for updates"
        return 0
    fi
    
    local lock_time=$(stat -f %m "$LOCK_FILE" 2>/dev/null || stat -c %Y "$LOCK_FILE" 2>/dev/null)
    local now=$(date +%s)
    local age=$((now - lock_time))
    local stale=""
    
    if [ $age -gt $LOCK_TIMEOUT ]; then
        stale=" (STALE)"
    fi
    
    local agent_id=$(grep -o '"agentId": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
    local acquired=$(grep -o '"acquiredAt": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
    
    echo "Status: LOCKED$stale"
    echo "Agent: $agent_id"
    echo "Acquired: $acquired"
    echo "Age: ${age}s"
    
    if [ -n "$stale" ]; then
        echo ""
        echo "Lock is stale and can be overridden by next acquire attempt"
    fi
}

force_release() {
    if [ -f "$LOCK_FILE" ]; then
        local agent_id=$(grep -o '"agentId": "[^"]*"' "$LOCK_FILE" | cut -d'"' -f4)
        echo "Force releasing lock held by $agent_id"
    fi
    rm -f "$LOCK_FILE"
    echo "Lock force released"
}

case "$1" in
    acquire)
        if [ -z "$2" ]; then
            echo "Usage: $0 acquire <agent-id>"
            exit 1
        fi
        acquire_lock "$2"
        ;;
    release)
        if [ -z "$2" ]; then
            echo "Usage: $0 release <agent-id>"
            exit 1
        fi
        release_lock "$2"
        ;;
    status)
        show_status
        ;;
    force-release)
        force_release
        ;;
    *)
        echo "Manifest Lock Utility"
        echo ""
        echo "Commands:"
        echo "  acquire <agent-id>  - Acquire lock (waits up to 10s if held)"
        echo "  release <agent-id>  - Release lock (only if held by same agent)"
        echo "  status              - Show current lock status"
        echo "  force-release       - Force release any lock"
        echo ""
        echo "Examples:"
        echo "  $0 acquire dev-loop"
        echo "  $0 release dev-loop"
        echo "  $0 status"
        ;;
esac
