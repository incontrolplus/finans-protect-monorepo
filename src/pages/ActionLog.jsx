import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const ACTION_COLORS = {
  status_change: 'text-blue-400',
  sms_code_received: 'text-yellow-400',
  email_classified: 'text-orange-400',
  payout_generated: 'text-emerald-400',
  payout_approved: 'text-green-400',
  payout_rejected: 'text-red-400',
  admin_action: 'text-purple-400',
  error: 'text-red-500',
  signup_started: 'text-blue-300',
  signup_completed: 'text-green-300',
};

function ActionLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    ownerId: '',
    limit: 100,
  });

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.set('action', filters.action);
      if (filters.ownerId) params.set('ownerId', filters.ownerId);
      params.set('limit', filters.limit);

      const res = await fetch(`${API_BASE}/api/admin/logs?${params}`);
      const data = await res.json();
      if (data.success) setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const actionTypes = [...new Set(logs.map(l => l.action).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Action Log</h1>
          <p className="text-gray-400 mt-1">Пълен audit trail на всички действия</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Обнови
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
            Задача 40
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.action}
            onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Actions</option>
            {actionTypes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="text"
            value={filters.ownerId}
            onChange={(e) => setFilters(f => ({ ...f, ownerId: e.target.value }))}
            placeholder="Owner ID..."
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={filters.limit}
            onChange={(e) => setFilters(f => ({ ...f, limit: parseInt(e.target.value) }))}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={250}>Last 250</option>
            <option value={500}>Last 500</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {logs.map((log, i) => {
          const color = ACTION_COLORS[log.action] || 'text-gray-400';
          const prevLog = logs[i - 1];
          const showDateSep = !prevLog ||
            new Date(log.created_at).toDateString() !== new Date(prevLog.created_at).toDateString();

          return (
            <React.Fragment key={log.id || i}>
              {showDateSep && (
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-dark-700" />
                  <span className="text-xs text-gray-600 font-medium">
                    {new Date(log.created_at).toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <div className="h-px flex-1 bg-dark-700" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="flex items-start gap-3 bg-dark-800/30 hover:bg-dark-800/50 rounded-lg p-3 transition-colors"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                  {i < logs.length - 1 && <div className="w-px h-full bg-dark-700 mt-1" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${color}`}>{log.action}</span>
                    <span className="text-gray-600 text-xs flex-shrink-0">
                      {new Date(log.created_at).toLocaleTimeString('bg-BG')}
                    </span>
                  </div>

                  {/* Status transition */}
                  {log.old_status && log.new_status && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      <span className="text-gray-500">{log.old_status}</span>
                      {' \u2192 '}
                      <span className="text-white">{log.new_status}</span>
                    </p>
                  )}

                  {/* IDs */}
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                    {log.owner_id && <span>Owner: {log.owner_id.slice(0, 8)}</span>}
                    {log.account_id && <span>Account: {log.account_id.slice(0, 8)}</span>}
                    {log.performed_by && <span>By: {log.performed_by}</span>}
                  </div>

                  {/* Details */}
                  {log.details && (
                    <p className="text-gray-500 text-xs mt-1 truncate max-w-xl">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </p>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}

        {logs.length === 0 && (
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
            <p className="text-gray-500">Няма логове</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionLog;
