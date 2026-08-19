#!/bin/bash
# Open Balancer — Consolidated Infrastructure Watchdog & SLA Daemon
# Runs every 5 minutes: gathers device heartbeats, checks fleet health,
# executes auto-remediation, and synchronizes telemetry to supabase-ob.

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

LOG_DIR="$HOME/Library/Logs/openbalancer"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/watchdog_consolidated.log"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S UTC')
echo "=== Open Balancer Watchdog Cycle: $TIMESTAMP ===" >> "$LOG_FILE"

# 1. Record Device Heartbeat (CPU, RAM, Disk, Services)
if [ -f "$HOME/Wallestars/scripts/device_heartbeat_daemon.py" ]; then
    /usr/bin/python3 "$HOME/Wallestars/scripts/device_heartbeat_daemon.py" >> "$LOG_FILE" 2>&1
fi

# 2. Execute Fleet SLA Health Check & Auto-Remediation (Zero-Spam)
if [ -f "$HOME/Wallestars/scripts/heartbeat-monitor.py" ]; then
    /usr/bin/python3 "$HOME/Wallestars/scripts/heartbeat-monitor.py" >> "$LOG_FILE" 2>&1
fi

# 3. Process any locally spooled executions / heartbeats to Supabase
SPOOL_DIR="$LOG_DIR/spool_executions"
if [ -d "$SPOOL_DIR" ] && [ "$(ls -A "$SPOOL_DIR" 2>/dev/null)" ]; then
    echo "Processing spooled telemetry records..." >> "$LOG_FILE"
    for f in "$SPOOL_DIR"/*.json; do
        if [ -f "$f" ]; then
            # Attempt push to Supabase REST
            curl -s -X POST \
                -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZW5iYWxhbmNlciIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MTc5NTI5OTAsImV4cCI6MjAzMzUyODk5MH0.z5uXJq6k4fO6F4WwW8qXJq6k4fO6F4WwW8qXJq6k4fO" \
                -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZW5iYWxhbmNlciIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MTc5NTI5OTAsImV4cCI6MjAzMzUyODk5MH0.z5uXJq6k4fO6F4WwW8qXJq6k4fO6F4WwW8qXJq6k4fO" \
                -H "Content-Type: application/json" \
                -d @"$f" \
                "http://100.83.83.8:8002/rest/v1/workflow_executions" > /dev/null 2>&1 && rm -f "$f"
        fi
    done
fi

echo "=== Watchdog Cycle Completed: $(date '+%Y-%m-%d %H:%M:%S UTC') ===" >> "$LOG_FILE"
