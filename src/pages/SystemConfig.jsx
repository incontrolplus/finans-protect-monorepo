import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const CONFIG_GROUPS = {
  'Webhook URLs': ['n8n_webhook_base_url', 'n8n_process_pending_webhook', 'n8n_lifecycle_webhook', 'n8n_email_processor_webhook', 'n8n_signup_flow_webhook'],
  'Timeout Settings': ['signup_timeout_hours', 'sms_timeout_minutes', 'email_timeout_minutes', 'contract_timeout_hours', 'review_timeout_days'],
  'Limits': ['max_signups_per_day', 'max_signups_per_hour', 'max_retries', 'daily_payout_limit_eur', 'hourly_payout_limit_count'],
  'SMS Provider': ['sms_provider_primary', 'sms_provider_backup'],
  'Email Provider': ['email_imap_host', 'email_poll_interval_seconds'],
  'Airtop Settings': ['airtop_session_timeout_minutes', 'airtop_proxy_country', 'airtop_proxy_type'],
  'Payout Settings': ['default_affiliate_bonus_eur', 'partner_commission_percent', 'payout_auto_approve_threshold'],
};

function SystemConfig() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [editValues, setEditValues] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);
  const [timeouts, setTimeouts] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/config`);
      const data = await res.json();
      if (data.success) {
        const configMap = {};
        (data.config || []).forEach((c) => {
          configMap[c.key] = c;
        });
        setConfig(configMap);
        setEditValues(
          Object.fromEntries(
            Object.entries(configMap).map(([k, v]) => [k, v.value])
          )
        );
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeouts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/timeouts`);
      const data = await res.json();
      if (data.success) setTimeouts(data.timedOut || []);
    } catch (err) {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchTimeouts();
  }, [fetchConfig, fetchTimeouts]);

  const saveConfig = async (key) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/admin/config/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editValues[key] }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`${key} updated`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchConfig();
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const isChanged = (key) => {
    return config[key] && editValues[key] !== config[key].value;
  };

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
          <h1 className="text-2xl font-bold text-white">System Configuration</h1>
          <p className="text-gray-400 mt-1">Управление на app_config, timeouts и provider настройки</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { fetchConfig(); fetchTimeouts(); }}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            Refresh
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
            Задача 49
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
        >
          <p className="text-green-400 text-sm">{successMsg}</p>
        </motion.div>
      )}

      {/* Timed Out Accounts Alert */}
      {timeouts && timeouts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-5">
          <h3 className="text-red-400 font-medium mb-2">Timed Out Accounts ({timeouts.length})</h3>
          <div className="space-y-2">
            {timeouts.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{t.owner_name} - {t.company_name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">{t.status}</span>
                  <span className="text-red-400">{Math.round(t.hours_in_status)}h</span>
                </div>
              </div>
            ))}
            {timeouts.length > 5 && (
              <p className="text-gray-500 text-xs">+ {timeouts.length - 5} more</p>
            )}
          </div>
        </div>
      )}

      {/* Config Groups */}
      {Object.entries(CONFIG_GROUPS).map(([group, keys]) => (
        <div key={group} className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">{group}</h3>
          <div className="space-y-3">
            {keys.map((key) => {
              const entry = config[key];
              const isSecret = entry?.is_secret;
              return (
                <div key={key} className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm text-gray-400 mb-1">
                      {key}
                      {entry?.description && (
                        <span className="text-gray-600 ml-2">({entry.description})</span>
                      )}
                    </label>
                    {isSecret ? (
                      <div className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-500 text-sm">
                        ******** (secret)
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editValues[key] || ''}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                        placeholder={`Enter ${key}`}
                      />
                    )}
                  </div>
                  {!isSecret && (
                    <button
                      onClick={() => saveConfig(key)}
                      disabled={!isChanged(key) || saving[key]}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-5 ${
                        isChanged(key)
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {saving[key] ? '...' : 'Save'}
                    </button>
                  )}
                </div>
              );
            })}
            {keys.every((k) => !config[k]) && (
              <p className="text-gray-600 text-sm">
                No config entries found. Apply migration 004 to create default values.
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Raw Config */}
      <details className="bg-dark-800/30 border border-dark-700/50 rounded-xl">
        <summary className="p-4 text-gray-400 text-sm cursor-pointer hover:text-gray-300">
          All Config Values ({Object.keys(config).length} entries)
        </summary>
        <div className="p-4 pt-0">
          <div className="bg-dark-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-gray-400 font-mono">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(config).map(([k, v]) => [k, v.is_secret ? '********' : v.value])
                ),
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}

export default SystemConfig;
