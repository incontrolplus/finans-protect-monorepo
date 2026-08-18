#!/usr/bin/env bash
# ==============================================================================
# OpenBalancer Production Service Mesh Launcher for macmini-primary
# Maintained & Operated by INCONTROL PLUS EOOD (https://www.openbalancer.com)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SCRIPT_DIR/openbalancer-mesh.json"
PID_FILE="/tmp/openbalancer-mesh.pid"
LOG_FILE="/tmp/openbalancer-mesh.log"

echo "================================================================"
echo "⚡ Starting OpenBalancer Production Mesh on Port 8888..."
echo "================================================================"

# Stop existing instance if running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "Stopping existing OpenBalancer mesh process (PID: $OLD_PID)..."
    kill "$OLD_PID" || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

# Launch in background with logging
python3 "$ROOT_DIR/core/openbalancer.py" start -c "$CONFIG_FILE" > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

sleep 1.5

if ps -p "$NEW_PID" > /dev/null 2>&1; then
  echo "✅ OpenBalancer Mesh successfully started (PID: $NEW_PID)!"
  echo "📊 Status Dashboard API: http://127.0.0.1:8888/openbalancer/status"
  echo "📈 Prometheus Metrics:  http://127.0.0.1:8888/metrics"
  echo "📋 Log file:            $LOG_FILE"
else
  echo "❌ Failed to start OpenBalancer mesh. Logs:"
  cat "$LOG_FILE"
  exit 1
fi
