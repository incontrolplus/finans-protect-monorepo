import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Terminal,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  Zap,
  Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const ACTION_COLORS = {
  status_change: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
  sms_code_received: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  email_classified: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  payout_generated: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  payout_approved: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
  payout_rejected: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  admin_action: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  error: 'text-rose-500 bg-rose-500/20 border-rose-500/40',
  signup_started: 'text-blue-300 bg-blue-500/15 border-blue-500/30',
  signup_completed: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
};

export function ActionLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    ownerId: '',
    limit: 100,
  });

  const fetchLogs = useCallback(async () => {
    setIsRefreshing(true);
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
      setTimeout(() => setIsRefreshing(false), 500);
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
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Action Log...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Action Audit Trail &amp; Telemetry</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Хронологичен регистър на всички потребителски, финансови и системни събития в платформата.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Audit Trail SSOT
            </span>
            <button
              onClick={fetchLogs}
              disabled={isRefreshing}
              className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Обновяване...' : 'Обнови'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Filter Bento Controls */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filters.action}
            onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer"
          >
            <option value="">Всички Действия (All Actions)</option>
            {actionTypes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.ownerId}
            onChange={(e) => setFilters(f => ({ ...f, ownerId: e.target.value }))}
            placeholder="Търсене по Owner ID..."
            className="flex-1 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-500 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none font-mono"
          />

          <select
            value={filters.limit}
            onChange={(e) => setFilters(f => ({ ...f, limit: parseInt(e.target.value) }))}
            className="w-full sm:w-40 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all shadow-inner outline-none cursor-pointer font-mono"
          >
            <option value={50}>Последни 50</option>
            <option value={100}>Последни 100</option>
            <option value={250}>Последни 250</option>
            <option value={500}>Последни 500</option>
          </select>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-4">
        {logs.map((log, i) => {
          const colorClass = ACTION_COLORS[log.action] || 'text-slate-300 bg-white/5 border-white/10';
          const prevLog = logs[i - 1];
          const showDateSep = !prevLog ||
            new Date(log.created_at).toDateString() !== new Date(prevLog.created_at).toDateString();

          return (
            <React.Fragment key={log.id || i}>
              {showDateSep && (
                <div className="flex items-center gap-4 py-3">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    {new Date(log.created_at).toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
                className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 shadow-md hover:border-cyan-500/30 transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${colorClass}`}>
                      {log.action}
                    </span>
                    {log.old_status && log.new_status && (
                      <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                        <span className="text-slate-500">{log.old_status}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                        <span className="text-white font-bold">{log.new_status}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString('bg-BG')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  {log.owner_id && <span>Owner: <strong className="text-cyan-300">{log.owner_id.slice(0, 8)}...</strong></span>}
                  {log.account_id && <span>Account: <strong className="text-purple-300">{log.account_id.slice(0, 8)}...</strong></span>}
                  {log.performed_by && <span>Actor: <strong className="text-slate-200">{log.performed_by}</strong></span>}
                </div>

                {log.details && (
                  <p className="text-xs font-mono text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5 truncate max-w-full">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </p>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}

        {logs.length === 0 && (
          <div className="p-16 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
            <p className="text-sm">Няма записани логове за избраните филтри.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionLog;

