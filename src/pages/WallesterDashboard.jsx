import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Activity,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Euro,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Database,
  Globe2,
  Zap,
  ChevronRight,
  Layers
} from 'lucide-react';

import { AccountingTelemetryBento } from '../components/AccountingTelemetryBento';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function WallesterDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [queue, setQueue] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [metricsRes, queueRes, ownersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/system_metrics?select=*&limit=1`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/processing_queue?select=*&order=hours_in_status.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/owner_dashboard?select=*&order=last_activity.desc.nullslast&limit=100`, { headers }),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m[0] || null);
      }
      if (queueRes.ok) setQueue(await queueRes.json());
      if (ownersRes.ok) setOwners(await ownersRes.json());

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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statusConfig = {
    pending_signup: { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Pending' },
    signup_in_progress: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Signup' },
    awaiting_sms: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'SMS Wait' },
    sms_received: { bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'SMS OK' },
    awaiting_email: { bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Email Wait' },
    email_received: { bg: 'bg-orange-400/20 text-orange-200 border-orange-400/30', label: 'Email OK' },
    awaiting_contract: { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Contract' },
    contract_signed: { bg: 'bg-purple-400/20 text-purple-200 border-purple-400/30', label: 'Signed' },
    pending_review: { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', label: 'Review' },
    verified: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Verified' },
    affiliate_pending: { bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30', label: 'Affiliate' },
    affiliate_confirmed: { bg: 'bg-teal-400/20 text-teal-200 border-teal-400/30', label: 'Bonus Confirmed' },
    payout_pending: { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', label: 'Payout Wait' },
    payout_completed: { bg: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40', label: 'Completed' },
    rejected: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Rejected' },
    failed: { bg: 'bg-rose-600/20 text-rose-200 border-rose-600/30', label: 'Failed' },
    needs_attention: { bg: 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse', label: 'Needs Attention' },
  };

  const MetricCard = ({ label, value, subtext, icon: Icon, color = 'text-white', glow = 'from-cyan-500/10' }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl p-5 bg-gradient-to-br ${glow} via-[#0c1426]/70 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-cyan-500/40 transition-all overflow-hidden flex flex-col justify-between group`}
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-300 tracking-wide">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${color}`}>{value ?? '-'}</p>
        {subtext && <p className="text-[11px] font-mono text-slate-400 mt-1">{subtext}</p>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Зареждане на Wallester SSOT Телеметрия...</p>
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
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Wallester Operations Dashboard</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Мониторинг на действителни собственици, Wallester Business акаунти и пълен lifecycle статус.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              SSOT Cluster Telemetry
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              30s Realtime Polling
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
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-slate-400 text-[11px]">Проверете връзката към Supabase базата данни.</p>
          </div>
        </motion.div>
      )}

      {/* Metrics Bento Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Общо Owners"
            value={metrics.total_owners}
            icon={Users}
            color="text-white"
            subtext="Вписани в базата"
          />
          <MetricCard
            label="Pending Регистрации"
            value={metrics.pending_owners}
            icon={Clock}
            color="text-amber-400"
            subtext="В начален статус"
            glow="from-amber-500/10"
          />
          <MetricCard
            label="Eligible Бизнеси"
            value={metrics.eligible_businesses}
            icon={ShieldCheck}
            color="text-emerald-400"
            subtext=">=50% дял & Mod 11"
            glow="from-emerald-500/10"
          />
          <MetricCard
            label="Wallester Акаунти"
            value={metrics.total_accounts}
            icon={CreditCard}
            color="text-cyan-400"
            subtext="Издадени карти"
            glow="from-cyan-500/10"
          />
          <MetricCard
            label="Общо Изплатено"
            value={`€${metrics.total_paid_amount || '0'}`}
            icon={Euro}
            color="text-emerald-400"
            subtext={`${metrics.completed || 0} финализирани`}
            glow="from-emerald-500/15"
          />
        </div>
      )}

      {/* Account Lifecycle Pipeline Bento Box */}
      <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden space-y-5">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Account Lifecycle Pipeline</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Опашка: <strong className="text-cyan-300">{queue.length}</strong> активни записа
          </span>
        </div>

        <div className="flex items-center justify-between overflow-x-auto pb-3 gap-2 scrollbar-thin scrollbar-thumb-white/10">
          {[
            { status: 'pending_signup', label: 'Pending', color: 'from-slate-600 to-slate-700' },
            { status: 'signup_in_progress', label: 'Signup', color: 'from-blue-600 to-cyan-600' },
            { status: 'awaiting_sms', label: 'SMS Wait', color: 'from-amber-600 to-yellow-600' },
            { status: 'awaiting_email', label: 'Email Wait', color: 'from-orange-600 to-amber-600' },
            { status: 'awaiting_contract', label: 'Contract', color: 'from-purple-600 to-indigo-600' },
            { status: 'pending_review', label: 'Review', color: 'from-indigo-600 to-blue-600' },
            { status: 'verified', label: 'Verified', color: 'from-teal-600 to-emerald-600' },
            { status: 'affiliate_pending', label: 'Affiliate', color: 'from-emerald-600 to-teal-600' },
            { status: 'payout_pending', label: 'Payout', color: 'from-cyan-600 to-blue-600' },
            { status: 'payout_completed', label: 'Completed', color: 'from-emerald-500 to-emerald-600' },
          ].map((step, idx, arr) => {
            const count = queue.filter(q => q.status === step.status).length;
            return (
              <React.Fragment key={step.status}>
                <div className="flex flex-col items-center min-w-[76px] p-2 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-extrabold bg-gradient-to-tr ${step.color} shadow-lg ${count > 0 ? 'ring-2 ring-cyan-400/50 scale-105' : 'opacity-60'}`}>
                    {count}
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 mt-2 whitespace-nowrap">{step.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex-shrink-0 w-3 h-0.5 bg-white/10" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Warning / Error status summary pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-medium">Критични състояния:</span>
          {[
            { status: 'failed', label: 'Failed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
            { status: 'needs_attention', label: 'Needs Attention', color: 'bg-rose-500/25 text-rose-200 border-rose-500/40 animate-pulse' },
            { status: 'rejected', label: 'Rejected', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
          ].map((step) => {
            const count = queue.filter(q => q.status === step.status).length;
            return (
              <div key={step.status} className={`px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-2 ${step.color}`}>
                <span className="font-bold">{count}</span>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 w-fit">
        {[
          { id: 'overview', label: 'Всички Собственици (Owners)', count: owners.length },
          { id: 'accounting', label: '📊 Microinvest Телеметрия', count: null },
          { id: 'queue', label: 'Активна Опашка (Queue)', count: queue.length },
          { id: 'lifecycle', label: 'Lifecycle Диаграма', count: null },
          { id: 'attention', label: 'Needs Attention', count: metrics?.needs_attention || queue.filter(q => q.status === 'needs_attention' || q.status === 'failed').length },
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
            {tab.count !== null && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-black/30 text-white'
                  : tab.id === 'attention' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Panes */}
      <AnimatePresence mode="wait">
        {/* 1. Owners Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Действителен Собственик</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-center">Бизнеси</th>
                    <th className="p-4 text-center">Eligible (≥ 50%)</th>
                    <th className="p-4 text-center">Wallester Карти</th>
                    <th className="p-4 text-center">Completed</th>
                    <th className="p-4 text-center">Attention</th>
                    <th className="p-4 text-right">Последна Активност</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {owners.map((owner) => (
                    <tr key={owner.owner_id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white tracking-tight">{owner.full_name}</div>
                        {owner.phone && <div className="text-[11px] font-mono text-slate-400">{owner.phone}</div>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          owner.owner_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          owner.owner_status === 'processing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          owner.owner_status === 'failed' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }`}>
                          {owner.owner_status || 'New'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-200">{owner.total_businesses || 0}</td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[11px]">
                          {owner.eligible_businesses || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-cyan-300 font-bold">{owner.wallester_accounts_count || 0}</td>
                      <td className="p-4 text-center font-mono text-emerald-400 font-bold">{owner.completed_payouts || 0}</td>
                      <td className="p-4 text-center">
                        {owner.needs_attention_count > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold text-xs">
                            {owner.needs_attention_count}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">0</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-400">
                        {owner.last_activity ? new Date(owner.last_activity).toLocaleDateString('bg-BG') : '-'}
                      </td>
                    </tr>
                  ))}
                  {owners.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-600" />
                        <p className="font-semibold text-white">Няма регистрирани собственици</p>
                        <p className="text-xs">Въведете нов собственик в секцията "Eligibility Check".</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 2. Queue Tab */}
        {activeTab === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Собственик</th>
                    <th className="p-4">Фирма</th>
                    <th className="p-4">ЕИК</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-center">Опити</th>
                    <th className="p-4 text-right">Часове в статус</th>
                    <th className="p-4">Последна Грешка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {queue.map((item) => {
                    const cfg = statusConfig[item.status] || { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: item.status };
                    return (
                      <tr key={item.account_id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-bold text-white">{item.owner_name}</td>
                        <td className="p-4 text-slate-200">{item.company_name}</td>
                        <td className="p-4 font-mono font-bold text-cyan-300">{item.eik}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${cfg.bg}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono text-slate-300">{item.attempt_count || 0}</td>
                        <td className="p-4 text-right font-mono text-slate-400">
                          {item.hours_in_status != null ? `${Math.round(item.hours_in_status)}h` : '-'}
                        </td>
                        <td className="p-4 text-rose-300 text-xs max-w-xs truncate font-mono">
                          {item.last_error || '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {queue.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                        <p className="font-semibold text-white">Опашката е напълно обработена</p>
                        <p className="text-xs">Всички текущи Wallester заявки са синхронизирани.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 3. Lifecycle Tab */}
        {activeTab === 'lifecycle' && (
          <motion.div
            key="lifecycle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* State Machine Transitions Card */}
            <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">State Machine Преходи &amp; Автоматизация</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { from: 'pending_signup', to: 'signup_in_progress', trigger: 'Airtop / Browser сесия стартирана', timeout: null },
                  { from: 'signup_in_progress', to: 'awaiting_sms', trigger: 'Форма за регистрация подадена', timeout: '2h' },
                  { from: 'awaiting_sms', to: 'sms_received', trigger: 'SMS код успешно получен', timeout: '30min' },
                  { from: 'sms_received', to: 'awaiting_email', trigger: 'SMS валидация завършена', timeout: null },
                  { from: 'awaiting_email', to: 'email_received', trigger: 'Имейл потвърждение получено', timeout: '60min' },
                  { from: 'email_received', to: 'awaiting_contract', trigger: 'Имейл верифициран', timeout: null },
                  { from: 'awaiting_contract', to: 'contract_signed', trigger: 'Административно подписване', timeout: '48h' },
                  { from: 'contract_signed', to: 'pending_review', trigger: 'Изпратено към Wallester Compliance', timeout: null },
                  { from: 'pending_review', to: 'verified', trigger: 'Wallester одобрение', timeout: '7d' },
                  { from: 'verified', to: 'affiliate_pending', trigger: 'Affiliate проверка активирана', timeout: null },
                  { from: 'affiliate_pending', to: 'affiliate_confirmed', trigger: 'Потвърден €150 бонус', timeout: '30d' },
                  { from: 'affiliate_confirmed', to: 'payout_pending', trigger: 'Генерирано плащане в опашката', timeout: null },
                  { from: 'payout_pending', to: 'payout_completed', trigger: 'Успешен банков / крипто превод', timeout: null },
                ].map((t, i) => {
                  const fCfg = statusConfig[t.from] || { bg: 'bg-white/10 text-white border-white/10', label: t.from };
                  const tCfg = statusConfig[t.to] || { bg: 'bg-white/10 text-white border-white/10', label: t.to };
                  return (
                    <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${fCfg.bg} truncate`}>
                          {fCfg.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${tCfg.bg} truncate`}>
                          {tCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{t.trigger}</span>
                        {t.timeout && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono">
                            {t.timeout}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeout Rules Bento Box */}
            <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
                  SLA &amp; Автоматични Лимити за Време (Timeouts)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Signup Timeout', val: '2 часа' },
                  { label: 'SMS Wait Timeout', val: '30 мин' },
                  { label: 'Email Wait Timeout', val: '60 мин' },
                  { label: 'Contract Signing', val: '48 часа' },
                  { label: 'Wallester Review', val: '7 дни' },
                  { label: 'Affiliate Confirmation', val: '30 дни' },
                  { label: 'Максимум Опити', val: '3 ретрая' },
                  { label: 'Retry Delay Интервал', val: 'attempt * 30m' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-[11px] text-slate-400">{item.label}</p>
                    <p className="text-sm font-mono font-bold text-cyan-300">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. Attention Tab */}
        {activeTab === 'attention' && (
          <motion.div
            key="attention"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {queue
              .filter((item) => item.status === 'needs_attention' || item.status === 'failed')
              .map((item) => (
                <div
                  key={item.account_id}
                  className="rounded-3xl p-6 bg-gradient-to-br from-rose-500/10 via-[#160c14]/90 to-[#080d1a] border border-rose-500/30 shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {item.owner_name} — {item.company_name}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">ЕИК: <strong className="text-cyan-300">{item.eik}</strong></p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.status}
                    </span>
                  </div>

                  {item.last_error && (
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/20 text-rose-300 font-mono text-xs">
                      {item.last_error}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-white/5">
                    <span>Опити: <strong className="text-white">{item.attempt_count || 0}</strong></span>
                    <span>В статус: <strong className="text-white">{Math.round(item.hours_in_status || 0)}h</strong></span>
                    {item.next_retry_at && (
                      <span>Следващ автоматичен опит: <strong className="text-cyan-300">{new Date(item.next_retry_at).toLocaleString('bg-BG')}</strong></span>
                    )}
                  </div>
                </div>
              ))}

            {queue.filter((item) => item.status === 'needs_attention' || item.status === 'failed').length === 0 && (
              <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[#0a1824]/90 to-[#080d1a] border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Всички процеси протичат гладко!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Няма блокирани или изискващи ръчна намеса Wallester акаунти. Системата работи в автоматичен режим.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* 5. Microinvest Accounting Telemetry Tab */}
        {activeTab === 'accounting' && (
          <motion.div
            key="accounting"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <AccountingTelemetryBento />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WallesterDashboard;

