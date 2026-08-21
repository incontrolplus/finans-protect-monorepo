import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw,
  Send,
  Check,
  Copy,
  Layers,
  Inbox,
  Server,
  ArrowRight,
  Globe2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function VerificationPipeline() {
  const [accounts, setAccounts] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [manualCode, setManualCode] = useState({});

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [accountsRes, logsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/wallester_accounts?select=*,verified_owners(full_name,phone,email),owner_businesses(company_name,eik)&status=in.(awaiting_sms,sms_received,awaiting_email,email_received)&order=updated_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/action_log?select=*&action=in.(sms_code_received,email_classified,sms_sent,email_sent)&order=created_at.desc&limit=50`, { headers }),
      ]);

      if (accountsRes.ok) setAccounts(await accountsRes.json());
      if (logsRes.ok) {
        const allLogs = await logsRes.json();
        setSmsLogs(allLogs.filter(l => l.action?.includes('sms')));
        setEmailLogs(allLogs.filter(l => l.action?.includes('email')));
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const submitManualCode = async (accountId, type) => {
    const code = manualCode[accountId];
    if (!code?.trim()) return;

    try {
      const endpoint = type === 'sms' ? '/api/wallester/sms-code' : '/api/wallester/email-event';
      const body = type === 'sms'
        ? { accountId, code: code.trim() }
        : { accountId, type: 'verification_code', code: code.trim() };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setManualCode((prev) => ({ ...prev, [accountId]: '' }));
        fetchData();
      } else {
        setError(data.error || 'Failed to submit code');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusConfig = {
    awaiting_sms: { label: 'Awaiting SMS', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', type: 'sms' },
    sms_received: { label: 'SMS Received', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', type: 'sms' },
    awaiting_email: { label: 'Awaiting Email', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', type: 'email' },
    email_received: { label: 'Email Received', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', type: 'email' },
  };

  const pendingAccounts = accounts.filter(a => a.status === 'awaiting_sms' || a.status === 'awaiting_email');
  const receivedAccounts = accounts.filter(a => a.status === 'sms_received' || a.status === 'email_received');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Verification Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Verification Pipeline &amp; OTP Hub</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Мониторинг в реално време на SMS OTP кодове и Email верификационни събития за Wallester.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              15s Realtime Sync
            </span>
            <button
              onClick={fetchData}
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

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Чакащи SMS (Awaiting)', count: accounts.filter(a => a.status === 'awaiting_sms').length, icon: MessageSquare, color: 'text-amber-400', glow: 'from-amber-500/10' },
          { label: 'Получени SMS (Ready)', count: accounts.filter(a => a.status === 'sms_received').length, icon: CheckCircle2, color: 'text-yellow-300', glow: 'from-yellow-500/10' },
          { label: 'Чакащи Имейл (Awaiting)', count: accounts.filter(a => a.status === 'awaiting_email').length, icon: Mail, color: 'text-orange-400', glow: 'from-orange-500/10' },
          { label: 'Получени Имейли (Ready)', count: accounts.filter(a => a.status === 'email_received').length, icon: Inbox, color: 'text-emerald-400', glow: 'from-emerald-500/10' },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-3xl p-5 bg-gradient-to-br ${c.glow} via-[#0c1426]/70 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-lg space-y-3 overflow-hidden`}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{c.label}</span>
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${c.color}`}>{c.count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'pending', label: 'Чакащи Верификации', count: pendingAccounts.length },
          { id: 'received', label: 'Получени Кодове', count: receivedAccounts.length },
          { id: 'sms_log', label: 'SMS Дневник (Logs)', count: smsLogs.length },
          { id: 'email_log', label: 'Email Дневник (Logs)', count: emailLogs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-black/30 text-white'
                  : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panes */}
      <AnimatePresence mode="wait">
        {/* 1. Pending Verifications */}
        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {pendingAccounts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[#0a1824]/90 to-[#080d1a] border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Няма чакащи OTP верификации</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Всички SMS и имейл кодове са обработени или препратени автоматично.
                </p>
              </div>
            ) : (
              pendingAccounts.map((account) => {
                const config = statusConfig[account.status] || { label: account.status, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', type: 'sms' };
                const isSmS = config.type === 'sms';

                return (
                  <div
                    key={account.id}
                    className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-4 overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {account.verified_owners?.full_name || account.owner_id}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          {account.owner_businesses?.company_name} | ЕИК: <strong className="text-cyan-300">{account.owner_businesses?.eik}</strong>
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs font-mono">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] text-slate-400 block font-sans">Телефон:</span>
                        <span className="text-white font-bold">{account.wallester_phone || '—'}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] text-slate-400 block font-sans">Имейл:</span>
                        <span className="text-white truncate block">{account.wallester_email || '—'}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] text-slate-400 block font-sans">{isSmS ? 'SMS Изпратен:' : 'Email Изпратен:'}</span>
                        <span className="text-slate-300">
                          {isSmS
                            ? account.sms_sent_at ? new Date(account.sms_sent_at).toLocaleTimeString('bg-BG') : '—'
                            : account.email_sent_at ? new Date(account.email_sent_at).toLocaleTimeString('bg-BG') : '—'}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] text-slate-400 block font-sans">Опити:</span>
                        <span className="text-cyan-300 font-bold">{account.attempt_count || 0}</span>
                      </div>
                    </div>

                    {/* Manual Code Input Form */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${
                      isSmS ? 'border-amber-500/30 bg-amber-500/5' : 'border-orange-500/30 bg-orange-500/5'
                    }`}>
                      <p className={`text-xs font-bold ${isSmS ? 'text-amber-300' : 'text-orange-300'}`}>
                        Ръчно въвеждане на {isSmS ? 'SMS Код' : 'Имейл Код / Линк'}
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={manualCode[account.id] || ''}
                          onChange={(e) => setManualCode((prev) => ({ ...prev, [account.id]: e.target.value }))}
                          placeholder={isSmS ? '123456' : 'Код или линк за верификация'}
                          className={`flex-1 px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-xs placeholder-slate-600 border ${
                            isSmS ? 'border-amber-500/40 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 font-mono tracking-widest' : 'border-orange-500/40 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20'
                          } outline-none`}
                        />
                        <button
                          onClick={() => submitManualCode(account.id, isSmS ? 'sms' : 'email')}
                          disabled={!manualCode[account.id]?.trim()}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md ${
                            isSmS
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:from-amber-400 hover:to-yellow-500 shadow-amber-500/20'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-400 hover:to-amber-500 shadow-orange-500/20'
                          }`}
                        >
                          Изпрати Код
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* 2. Received Codes Tab */}
        {activeTab === 'received' && (
          <motion.div
            key="received"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {receivedAccounts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
                <p className="text-sm">Няма текущо получени кодове.</p>
              </div>
            ) : (
              receivedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-3xl p-5 bg-gradient-to-br from-emerald-500/10 via-[#0a1824]/90 to-[#080d1a] border border-emerald-500/30 shadow-lg flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{account.verified_owners?.full_name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{account.owner_businesses?.company_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {account.status === 'sms_received' ? 'SMS Code Ready' : 'Email Code Ready'}
                    </span>
                    {account.sms_code && (
                      <p className="text-emerald-400 font-mono font-extrabold text-xl mt-1 tracking-widest">{account.sms_code}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* 3. SMS Log Tab */}
        {activeTab === 'sms_log' && (
          <motion.div
            key="sms_log"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Време</th>
                    <th className="p-4">Действие</th>
                    <th className="p-4">Акаунт ID</th>
                    <th className="p-4">Детайли</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {smsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 font-mono text-slate-400">{new Date(log.created_at).toLocaleString('bg-BG')}</td>
                      <td className="p-4 font-bold text-amber-400">{log.action}</td>
                      <td className="p-4 font-mono text-cyan-300">{(log.account_id || '').slice(0, 8)}...</td>
                      <td className="p-4 font-mono text-slate-300 max-w-xs truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </td>
                    </tr>
                  ))}
                  {smsLogs.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Няма SMS логове</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 4. Email Log Tab */}
        {activeTab === 'email_log' && (
          <motion.div
            key="email_log"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Време</th>
                    <th className="p-4">Действие</th>
                    <th className="p-4">Акаунт ID</th>
                    <th className="p-4">Тип</th>
                    <th className="p-4">Детайли</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 font-mono text-slate-400">{new Date(log.created_at).toLocaleString('bg-BG')}</td>
                      <td className="p-4 font-bold text-orange-400">{log.action}</td>
                      <td className="p-4 font-mono text-cyan-300">{(log.account_id || '').slice(0, 8)}...</td>
                      <td className="p-4 text-slate-300">{log.details?.type || '—'}</td>
                      <td className="p-4 font-mono text-slate-300 max-w-xs truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </td>
                    </tr>
                  ))}
                  {emailLogs.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Няма Email логове</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Bento Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">SMS Провайдъри</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Fanytel OTP Gateway (Primary)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400">SMSTome Failover Relay (Backup)</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">Standby</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Email &amp; AI Класификатор</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">IMAP Event Listener</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-400">AI Verification Link Extractor</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Claude AI Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPipeline;

