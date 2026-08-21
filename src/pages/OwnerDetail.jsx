import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  CreditCard,
  DollarSign,
  Activity,
  ArrowLeft,
  RefreshCw,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const STATUS_COLORS = {
  pending_signup: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  signup_in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  awaiting_sms: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  sms_received: 'bg-yellow-300/20 text-yellow-200 border-yellow-300/30',
  awaiting_email: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  email_received: 'bg-orange-300/20 text-orange-200 border-orange-300/30',
  awaiting_contract: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  contract_signed: 'bg-purple-300/20 text-purple-200 border-purple-300/30',
  pending_review: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  affiliate_pending: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  affiliate_confirmed: 'bg-teal-300/20 text-teal-200 border-teal-300/30',
  payout_pending: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  payout_completed: 'bg-emerald-600/20 text-emerald-200 border-emerald-600/30',
  rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  failed: 'bg-rose-600/20 text-rose-200 border-rose-600/30',
  needs_attention: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
};

function OwnerDetail({ ownerId, onBack }) {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('businesses');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOwner = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}`);
      const data = await res.json();
      if (data.success) {
        setOwner(data.owner);
        setNotes(data.owner.admin_notes || '');
      } else {
        setError(data.error || 'Failed to load owner');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchOwner();
    const interval = setInterval(fetchOwner, 30000);
    return () => clearInterval(interval);
  }, [fetchOwner]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      });
      const data = await res.json();
      if (!data.success) setError('Failed to save notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const retryOwner = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/owners/${ownerId}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) fetchOwner();
      else setError(data.error || 'Failed to retry');
    } catch (err) {
      setError(err.message);
    }
  };

  const transitionAccount = async (accountId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/accounts/${accountId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, performedBy: 'admin' }),
      });
      const data = await res.json();
      if (data.success) fetchOwner();
      else setError(data.error || 'Transition failed');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-cyan-400" />
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="rounded-3xl p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 text-center space-y-4">
        <p className="text-rose-400 text-sm font-mono">Собственикът не е намерен</p>
        {onBack && (
          <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 text-xs font-mono">
            &larr; Обратно към таблото
          </button>
        )}
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
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>{owner.full_name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-mono">
                ID: {ownerId?.slice(0, 16)}... | Фирмен профил & Onboarding история
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {owner.owner_status === 'failed' && (
              <button
                onClick={retryOwner}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/25"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Повтори</span>
              </button>
            )}
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border ${
              owner.owner_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              owner.owner_status === 'processing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
              owner.owner_status === 'failed' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
              'bg-slate-500/20 text-slate-300 border-slate-500/40'
            }`}>
              {owner.owner_status}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Owner Info & Admin Notes Bentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Лични & Контактни Данни</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Име</p>
              <p className="font-bold text-white">{owner.first_name}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Презиме</p>
              <p className="font-bold text-white">{owner.middle_name || '-'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Фамилия</p>
              <p className="font-bold text-white">{owner.last_name}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">ЕГН / Идентификатор</p>
              <p className="font-bold font-mono text-cyan-300">{owner.egn || '-'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Телефон</p>
              <p className="font-bold font-mono text-white">{owner.phone || '-'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Email</p>
              <p className="font-bold font-mono text-white truncate">{owner.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Admin Notes Bento */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Оперативни Бележки</span>
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-28 px-4 py-3 bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 rounded-2xl placeholder-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none resize-none shadow-inner"
            placeholder="Въведете оперативни бележки за този титуляр..."
          />
          <button
            onClick={saveNotes}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Запазване...' : 'Запази Бележките'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'businesses', label: 'Фирми & ЕИК', icon: Building2, count: owner.businesses?.length },
          { id: 'accounts', label: 'Wallester Акаунти', icon: CreditCard, count: owner.accounts?.length },
          { id: 'payouts', label: 'Изплащания', icon: DollarSign, count: owner.payouts?.length },
          { id: 'logs', label: 'Одитен Дневник', icon: Activity, count: owner.logs?.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/40 text-cyan-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Businesses Tab */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          {(owner.businesses || []).map((biz) => (
            <div
              key={biz.id}
              className={`relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border shadow-xl space-y-3 overflow-hidden ${
                biz.eligibility === 'eligible' ? 'border-emerald-500/40' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{biz.company_name}</h4>
                  {biz.company_name_en && <p className="text-slate-400 text-xs font-mono">{biz.company_name_en}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  biz.eligibility === 'eligible' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  biz.eligibility === 'not_eligible' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  'bg-slate-500/20 text-slate-300 border-slate-500/40'
                }`}>
                  {biz.eligibility}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">ЕИК</p>
                  <p className="font-bold font-mono text-cyan-300">{biz.eik}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Правна Форма</p>
                  <p className="font-bold text-white">{biz.business_type}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Дял Собственост</p>
                  <p className="font-bold font-mono text-emerald-300">{biz.ownership_share}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Седалище</p>
                  <p className="font-bold text-white truncate">{biz.address_city}, {biz.address_street}</p>
                </div>
              </div>
            </div>
          ))}
          {(owner.businesses || []).length === 0 && (
            <div className="rounded-3xl p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 text-center text-slate-500 font-mono text-xs">
              Няма регистрирани фирми
            </div>
          )}
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {(owner.accounts || []).map((acc) => (
            <div key={acc.id} className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl space-y-3 overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {acc.company_name || acc.business_id?.slice(0, 8)}
                  </h4>
                  <p className="text-slate-400 text-xs font-mono">Account ID: {acc.id?.slice(0, 16)}...</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${STATUS_COLORS[acc.status] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>
                  {acc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Wallester Email</p>
                  <p className="font-bold font-mono text-white truncate">{acc.wallester_email || '-'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Wallester Phone</p>
                  <p className="font-bold font-mono text-white">{acc.wallester_phone || '-'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Опити за Onboarding</p>
                  <p className="font-bold font-mono text-cyan-300">{acc.attempt_count || 0}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 mb-0.5">Последна Активност</p>
                  <p className="font-bold text-white">{acc.updated_at ? new Date(acc.updated_at).toLocaleString('bg-BG') : '-'}</p>
                </div>
              </div>

              {acc.last_error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                  {acc.last_error}
                </div>
              )}

              {/* Status transition controls */}
              {!['payout_completed', 'rejected'].includes(acc.status) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  {acc.status === 'failed' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'pending_signup')}
                      className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Рестартирай към Pending
                    </button>
                  )}
                  {acc.status === 'verified' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'affiliate_pending')}
                      className="px-3.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Маркирай Affiliate Pending
                    </button>
                  )}
                  {acc.status === 'affiliate_confirmed' && (
                    <button
                      onClick={() => transitionAccount(acc.id, 'payout_pending')}
                      className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Генерирай Payout
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Сума</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Метод</th>
                <th className="p-4">Партньор</th>
                <th className="p-4">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(owner.payouts || []).map((p) => (
                <tr key={p.id || p.payout_id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-bold font-mono text-cyan-300 text-sm">{p.amount} {p.currency}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                      p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      p.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-white font-mono">{p.payout_method || 'Crypto / USDT'}</td>
                  <td className="p-4 text-slate-300 font-mono">{p.partner_name || 'Direct'}</td>
                  <td className="p-4 text-slate-400 font-mono">{p.created_at ? new Date(p.created_at).toLocaleString('bg-BG') : '-'}</td>
                </tr>
              ))}
              {(owner.payouts || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">Няма изплащания</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {(owner.logs || []).map((log, i) => (
            <div key={log.id || i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-sm shadow-cyan-400/50" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white text-xs font-bold">{log.action}</p>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {log.created_at ? new Date(log.created_at).toLocaleString('bg-BG') : ''}
                  </span>
                </div>
                {log.old_status && (
                  <p className="text-cyan-400 text-[11px] font-mono mt-0.5">
                    {log.old_status} &rarr; {log.new_status}
                  </p>
                )}
                {log.details && (
                  <p className="text-slate-400 text-xs mt-0.5 truncate">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </p>
                )}
              </div>
            </div>
          ))}
          {(owner.logs || []).length === 0 && (
            <div className="rounded-3xl p-8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 text-center text-slate-500 font-mono text-xs">
              Няма одитни логове
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDetail;

