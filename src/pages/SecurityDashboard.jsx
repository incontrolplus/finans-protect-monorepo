import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const SECURITY_CHECKLIST = [
  {
    category: 'Access Control',
    items: [
      { id: 'supabase_rls', label: 'Supabase RLS policies enabled on all tables', severity: 'critical' },
      { id: 'service_key', label: 'SERVICE_ROLE_KEY used only server-side (never exposed to client)', severity: 'critical' },
      { id: 'anon_key', label: 'ANON_KEY used only for public endpoints', severity: 'high' },
      { id: 'api_auth', label: 'All admin API routes require authentication', severity: 'critical' },
      { id: 'env_vars', label: '.env files excluded from git (.gitignore)', severity: 'critical' },
    ],
  },
  {
    category: 'Network & Proxy',
    items: [
      { id: 'proxy_rotation', label: 'Proxy rotation configured for Airtop sessions', severity: 'high' },
      { id: 'ip_logging', label: 'IP logging enabled for all admin actions', severity: 'medium' },
      { id: 'rate_limiting', label: 'Rate limiting on public API endpoints', severity: 'high' },
      { id: 'cors_config', label: 'CORS configured to allow only trusted origins', severity: 'high' },
      { id: 'https_only', label: 'All endpoints enforce HTTPS', severity: 'critical' },
    ],
  },
  {
    category: 'Data Protection',
    items: [
      { id: 'password_hash', label: 'Passwords hashed (never stored in plain text)', severity: 'critical' },
      { id: 'vault_encryption', label: 'Credential vault uses encryption at rest', severity: 'critical' },
      { id: 'pii_masking', label: 'PII masked in logs and exports', severity: 'high' },
      { id: 'backup_encrypted', label: 'Database backups encrypted', severity: 'medium' },
      { id: 'session_timeout', label: 'Browser sessions have timeout policies', severity: 'medium' },
    ],
  },
  {
    category: 'Payment Security',
    items: [
      { id: 'payout_limit', label: 'Single payout limit: 500 EUR', severity: 'high' },
      { id: 'daily_limit', label: 'Daily payout limit: 2000 EUR', severity: 'high' },
      { id: 'rate_limit_payouts', label: 'Hourly payout rate limit: 10/hour', severity: 'medium' },
      { id: 'admin_approval', label: 'Admin approval required for payouts', severity: 'critical' },
      { id: 'payout_audit', label: 'Full audit trail for all payout actions', severity: 'high' },
    ],
  },
  {
    category: 'Monitoring',
    items: [
      { id: 'error_alerts', label: 'Error alerts via Telegram bot', severity: 'high' },
      { id: 'action_log', label: 'All status changes logged in action_log table', severity: 'high' },
      { id: 'daily_summary', label: 'Daily summary reports enabled', severity: 'medium' },
      { id: 'anomaly_detection', label: 'Unusual activity detection (multiple rapid signups)', severity: 'medium' },
      { id: 'key_rotation', label: 'API key rotation schedule (quarterly)', severity: 'medium' },
    ],
  },
];

const SEVERITY_COLORS = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

function SecurityDashboard() {
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('security_checklist') || '{}');
    } catch { return {}; }
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [accessLog, setAccessLog] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [scanning, setScanning] = useState(false);

  const runActiveScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/security/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && data.results) {
        setCheckedItems(data.results);
      }
    } catch (err) {
      console.error('Failed to run security scan:', err);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('security_checklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allItems = SECURITY_CHECKLIST.flatMap(c => c.items);
  const totalItems = allItems.length;
  const checkedCount = allItems.filter(i => checkedItems[i.id]).length;
  const score = Math.round((checkedCount / totalItems) * 100);

  const criticalUnchecked = allItems.filter(i => i.severity === 'critical' && !checkedItems[i.id]);

  const fetchAccessLog = useCallback(async () => {
    setLoadingLog(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/action-log?limit=20`);
      const data = await res.json();
      if (data.success) setAccessLog(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch access log:', err);
    } finally {
      setLoadingLog(false);
    }
  }, []);

  useEffect(() => { fetchAccessLog(); }, [fetchAccessLog]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Security audit, checklist и мониторинг
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runActiveScan}
            disabled={scanning}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg ${
              scanning 
                ? 'bg-dark-700 text-gray-400 cursor-not-allowed border border-dark-600' 
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20 border border-primary-500'
            }`}
          >
            <Shield className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Run Automated Audit'}
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            Задача 34
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 bg-dark-800/50 border border-dark-700 rounded-xl p-6 flex items-center space-x-6"
        >
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#374151" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}%
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold">Security Score</h3>
            <p className="text-gray-400 text-sm mt-1">{checkedCount}/{totalItems} checks passed</p>
            {criticalUnchecked.length > 0 && (
              <p className="text-red-400 text-sm mt-2">
                {criticalUnchecked.length} critical items need attention
              </p>
            )}
          </div>
        </motion.div>

        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{criticalUnchecked.length}</p>
          <p className="text-gray-500 text-xs mt-1">Critical Open</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{checkedCount}</p>
          <p className="text-gray-500 text-xs mt-1">Items Resolved</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalUnchecked.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <h3 className="text-red-400 font-medium text-sm mb-3">Critical Items Requiring Attention</h3>
          <div className="space-y-2">
            {criticalUnchecked.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{item.label}</span>
                <button
                  onClick={() => toggleItem(item.id)}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Security Checklist</h2>
        {SECURITY_CHECKLIST.map((category, ci) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.05 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setActiveCategory(activeCategory === category.category ? null : category.category)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-white font-medium">{category.category}</h3>
                <span className="text-gray-500 text-sm">
                  {category.items.filter(i => checkedItems[i.id]).length}/{category.items.length}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(category.items.filter(i => checkedItems[i.id]).length / category.items.length) * 100}%` }}
                  />
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${activeCategory === category.category ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {(activeCategory === category.category || activeCategory === null) && (
              <div className="px-5 pb-4 space-y-2">
                {category.items.map(item => (
                  <label
                    key={item.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-700/30 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500 bg-dark-700"
                    />
                    <span className={`flex-1 text-sm ${checkedItems[item.id] ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                      {item.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${SEVERITY_COLORS[item.severity]}`}>
                      {item.severity}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Log */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Action Log</h2>
          <button
            onClick={fetchAccessLog}
            disabled={loadingLog}
            className="px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
          >
            {loadingLog ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {accessLog.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500 text-sm">
                    {loadingLog ? 'Loading...' : 'No activity logs available'}
                  </td>
                </tr>
              ) : (
                accessLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-dark-700/30">
                    <td className="px-5 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.action?.includes('failed') ? 'bg-red-500/20 text-red-400' :
                        log.action?.includes('approved') ? 'bg-green-500/20 text-green-400' :
                        'bg-dark-700 text-gray-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">{log.entity_type}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{log.actor}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {log.created_at ? new Date(log.created_at).toLocaleString('bg-BG') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SecurityDashboard;
