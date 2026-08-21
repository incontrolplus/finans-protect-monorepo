import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Settings2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Lock,
  Globe2,
  Layers,
  Sparkles,
  ArrowRight,
  Server,
  Zap,
  Cpu
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const CONFIG_GROUPS = {
  'Webhook URLs & n8n Оркестрация': ['n8n_webhook_base_url', 'n8n_process_pending_webhook', 'n8n_lifecycle_webhook', 'n8n_email_processor_webhook', 'n8n_signup_flow_webhook'],
  'Времеви Лимити & Timeouts': ['signup_timeout_hours', 'sms_timeout_minutes', 'email_timeout_minutes', 'contract_timeout_hours', 'review_timeout_days'],
  'Оперативни Лимити & Anti-Spam': ['max_signups_per_day', 'max_signups_per_hour', 'max_retries', 'daily_payout_limit_eur', 'hourly_payout_limit_count'],
  'SMS Gateway Настройки': ['sms_provider_primary', 'sms_provider_backup'],
  'Имейл & IMAP Настройки': ['email_imap_host', 'email_poll_interval_seconds'],
  'Airtop / Browser Automation': ['airtop_session_timeout_minutes', 'airtop_proxy_country', 'airtop_proxy_type'],
  'Payout & Бонус Параметри': ['default_affiliate_bonus_eur', 'partner_commission_percent', 'payout_auto_approve_threshold'],
};

export function SystemConfig() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [editValues, setEditValues] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);
  const [timeouts, setTimeouts] = useState(null);

  const fetchConfig = useCallback(async () => {
    setIsRefreshing(true);
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
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  const fetchTimeouts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/timeouts`);
      const data = await res.json();
      if (data.success) setTimeouts(data.timedOut || []);
    } catch (err) {
      // silent fallback
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
        setSuccessMsg(`Параметърът "${key}" е запазен успешно`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchConfig();
      } else {
        setError(data.error || 'Неуспешно обновяване');
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
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на System Config...</p>
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
                <Sliders className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>System Configuration &amp; Global Flags</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Глобални параметри на ядрото, уебхуци, таймаути и оперативни лимити.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => { fetchConfig(); fetchTimeouts(); }}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Синхронизиране...' : 'Обнови'}</span>
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

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 backdrop-blur-md"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-semibold">{successMsg}</p>
        </motion.div>
      )}

      {/* Timed Out Accounts Bento Alert */}
      {timeouts && timeouts.length > 0 && (
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 via-[#0c1426]/80 to-[#080d1a] backdrop-blur-2xl border border-rose-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-rose-300 font-mono">
                Изтекли Сесии и Таймаути ({timeouts.length})
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Needs Attention
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            {timeouts.slice(0, 6).map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-300 truncate">{t.owner_name} ({t.company_name})</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{t.status}</span>
                  <span className="text-rose-400 font-bold">{Math.round(t.hours_in_status)}ч</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config Groups Bento Containers */}
      <div className="space-y-6">
        {Object.entries(CONFIG_GROUPS).map(([group, keys]) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-5 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">{group}</h3>
            </div>

            <div className="space-y-4">
              {keys.map((key) => {
                const entry = config[key];
                const isSecret = entry?.is_secret;
                const changed = isChanged(key);

                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-mono font-bold text-cyan-300">
                          {key}
                        </label>
                        {entry?.description && (
                          <span className="text-[11px] text-slate-400 truncate">
                            — {entry.description}
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5">
                        {isSecret ? (
                          <div className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-500 text-xs font-mono">
                            •••••••••••••••• (Encrypted KMS Secret)
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={editValues[key] || ''}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#090f1d]/90 text-white font-mono text-xs placeholder-slate-600 border border-white/10 hover:border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/15 focus:bg-[#0c1426] transition-all outline-none"
                            placeholder={`Въведете ${key}`}
                          />
                        )}
                      </div>
                    </div>

                    {!isSecret && (
                      <button
                        onClick={() => saveConfig(key)}
                        disabled={!changed || saving[key]}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all sm:self-end cursor-pointer shadow-md ${
                          changed
                            ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:from-cyan-400 hover:via-blue-500 shadow-cyan-500/25 active:scale-95'
                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {saving[key] ? 'Запис...' : 'Запази'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Raw Config Summary */}
      <details className="rounded-3xl p-5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 text-xs font-mono">
        <summary className="text-slate-300 font-bold cursor-pointer hover:text-white transition-colors">
          Преглед на Суров JSON Регистър ({Object.keys(config).length} параметъра)
        </summary>
        <div className="pt-4">
          <pre className="p-4 rounded-2xl bg-black/40 border border-white/5 text-slate-300 text-xs overflow-x-auto">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(config).map(([k, v]) => [k, v.is_secret ? '********' : v.value])
              ),
              null,
              2
            )}
          </pre>
        </div>
      </details>
    </div>
  );
}

export default SystemConfig;

